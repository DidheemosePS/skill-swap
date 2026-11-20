"""automatic settlement and late cancels

Revision ID: a7c3e9d41f08
Revises: 9333e016db5c
Create Date: 2026-11-20 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'a7c3e9d41f08'
down_revision: Union[str, Sequence[str], None] = '9333e016db5c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OLD_STATUSES = ('CONFIRMED', 'AWAITING_SETTLEMENT', 'PENDING_LEARNER_REVIEW', 'COMPLETED', 'DISPUTED', 'NO_SHOW_CONFIRMED', 'CANCELLED')
NEW_STATUSES = ('CONFIRMED', 'AWAITING_SETTLEMENT', 'COMPLETED', 'DISPUTED', 'NO_SHOW_CONFIRMED', 'MUTUAL_NO_SHOW', 'CANCELLED')


# Postgres can't drop a value from an enum, so the type is rebuilt: rename the old one, create the new one,
# move the column across through text, then drop the old type. Every row must already hold a value the new type has.
def _replace_session_status(values: tuple[str, ...]) -> None:
    op.execute('ALTER TYPE sessionstatus RENAME TO sessionstatus_old')
    sa.Enum(*values, name='sessionstatus').create(op.get_bind())
    op.execute('ALTER TABLE sessions ALTER COLUMN status TYPE sessionstatus USING status::text::sessionstatus')
    op.execute('DROP TYPE sessionstatus_old')


def upgrade() -> None:
    """Upgrade schema."""
    # sessions: the Daily room, who was absent, and Confirm now per member.
    op.add_column('sessions', sa.Column('room_name', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.create_unique_constraint(op.f('sessions_room_name_key'), 'sessions', ['room_name'])
    op.add_column('sessions', sa.Column('absent_user_id', sa.Integer(), nullable=True))
    op.create_foreign_key(op.f('sessions_absent_user_id_fkey'), 'sessions', 'users', ['absent_user_id'], ['id'])
    op.add_column('sessions', sa.Column('teacher_confirmed_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('sessions', sa.Column('learner_confirmed_at', sa.DateTime(timezone=True), nullable=True))

    # A teacher's old "mark complete" is their confirmation under the new rules; the session goes back to settling.
    op.execute("""
        UPDATE sessions SET status = 'AWAITING_SETTLEMENT', teacher_confirmed_at = teacher_marked_at
        WHERE status = 'PENDING_LEARNER_REVIEW'
    """)
    # The absent member of a settled no-show was the one its dispute ruled against.
    op.execute("""
        UPDATE sessions s SET absent_user_id = d.ruled_against
        FROM session_disputes d
        WHERE d.session_id = s.id AND s.status = 'NO_SHOW_CONFIRMED' AND d.cause = 'NO_SHOW'
    """)
    op.drop_column('sessions', 'teacher_marked_at')
    _replace_session_status(NEW_STATUSES)

    # attendance_records: webhooks only. Browser-reported rows can't be trusted for an automatic outcome.
    op.execute("DELETE FROM attendance_records WHERE source = 'CLIENT'")
    op.drop_column('attendance_records', 'source')
    op.execute('DROP TYPE attendancesource')

    # session_disputes: one kind (a concern), always raised by a member with a reason. Disputes the old
    # 72-hour job opened have no member behind them and no place in the new model.
    op.execute('DELETE FROM session_disputes WHERE raised_by IS NULL')
    op.execute("UPDATE session_disputes SET reason = 'No reason given.' WHERE reason IS NULL OR reason = ''")
    op.execute('UPDATE session_disputes SET reason = left(reason, 200)')
    op.alter_column('session_disputes', 'raised_by', existing_type=sa.Integer(), nullable=False)
    op.alter_column('session_disputes', 'reason', existing_type=sqlmodel.sql.sqltypes.AutoString(), type_=sqlmodel.sql.sqltypes.AutoString(length=200), nullable=False)
    op.drop_column('session_disputes', 'cause')
    op.execute('DROP TYPE disputecause')

    # swap_requests: when a session was called off, and whether it was past the 2-hour cutoff.
    op.add_column('swap_requests', sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True))
    # The server default only fills existing rows; the model sets the value on new ones.
    op.add_column('swap_requests', sa.Column('is_late_cancel', sa.Boolean(), server_default=sa.false(), nullable=False))
    op.alter_column('swap_requests', 'is_late_cancel', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('swap_requests', 'is_late_cancel')
    op.drop_column('swap_requests', 'cancelled_at')

    # Deleted disputes and browser attendance rows don't come back; the columns are refilled with neutral values.
    disputecause = sa.Enum('NO_SHOW', 'COMPLETION', 'NO_OUTCOME', name='disputecause')
    disputecause.create(op.get_bind())
    op.add_column('session_disputes', sa.Column('cause', disputecause, server_default='COMPLETION', nullable=False))
    op.alter_column('session_disputes', 'cause', server_default=None)
    op.alter_column('session_disputes', 'reason', existing_type=sqlmodel.sql.sqltypes.AutoString(length=200), type_=sqlmodel.sql.sqltypes.AutoString(), nullable=True)
    op.alter_column('session_disputes', 'raised_by', existing_type=sa.Integer(), nullable=True)

    attendancesource = sa.Enum('WEBHOOK', 'CLIENT', name='attendancesource')
    attendancesource.create(op.get_bind())
    op.add_column('attendance_records', sa.Column('source', attendancesource, server_default='WEBHOOK', nullable=False))
    op.alter_column('attendance_records', 'source', server_default=None)

    # The old type has no mutual no-show; the nearest old status is a confirmed no-show.
    op.execute("UPDATE sessions SET status = 'NO_SHOW_CONFIRMED' WHERE status = 'MUTUAL_NO_SHOW'")
    _replace_session_status(OLD_STATUSES)
    op.add_column('sessions', sa.Column('teacher_marked_at', sa.DateTime(timezone=True), nullable=True))
    op.execute('UPDATE sessions SET teacher_marked_at = teacher_confirmed_at')
    op.drop_column('sessions', 'learner_confirmed_at')
    op.drop_column('sessions', 'teacher_confirmed_at')
    op.drop_constraint(op.f('sessions_absent_user_id_fkey'), 'sessions', type_='foreignkey')
    op.drop_column('sessions', 'absent_user_id')
    op.drop_constraint(op.f('sessions_room_name_key'), 'sessions', type_='unique')
    op.drop_column('sessions', 'room_name')
