from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import Index, text

class SkillKind(str, Enum):
    TEACH = "teach"
    LEARN = "learn"

class ProficiencyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERT = "expert"

class Skill(SQLModel, table=True):
    __tablename__ = "skills"
    __table_args__ = (
        Index("ix_skills_name_lower", text("lower(name)"), unique=True),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    category: str = Field(nullable=False)
    is_custom: bool = Field(default=False, nullable=False)
    created_by: Optional[int] = Field(default=None, foreign_key="users.id", nullable=True)

# The (user_id, skill_id) key also enforces the rule that a skill can't be in both the teach and learn lists.
class UserSkill(SQLModel, table=True):
    __tablename__ = "user_skills"

    user_id: int = Field(foreign_key="users.id", primary_key=True, nullable=False)
    skill_id: int = Field(foreign_key="skills.id", primary_key=True, nullable=False)
    kind: SkillKind = Field(nullable=False)
    proficiency: ProficiencyLevel = Field(nullable=False)
