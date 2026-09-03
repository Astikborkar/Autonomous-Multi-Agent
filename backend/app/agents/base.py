import logging
import asyncio
from typing import Dict, Any
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str, agent_type: str):
        self.name = name
        self.agent_type = agent_type

    @abstractmethod
    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the agent's core responsibility asynchronously.
        Returns output dictionary to merge into LangGraph state.
        """
        pass
