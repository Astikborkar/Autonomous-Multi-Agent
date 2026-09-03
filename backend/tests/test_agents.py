import pytest
from app.agents.planner import PlannerAgent
from app.agents.researcher import ResearchAgent
from app.agents.analyzer import AnalyzerAgent
from app.agents.validator import ValidatorAgent
from app.agents.writer import WriterAgent

@pytest.mark.asyncio
async def test_planner_agent():
    planner = PlannerAgent()
    res = await planner.execute({"goal": "Analyze customer feedback"}, {})
    assert res["status"] == "COMPLETED"
    assert "dag_plan" in res
    assert len(res["dag_plan"]["tasks"]) == 4

@pytest.mark.asyncio
async def test_researcher_agent():
    researcher = ResearchAgent()
    res = await researcher.execute({"goal": "Test goal"}, {})
    assert res["status"] == "COMPLETED"
    assert "research_findings" in res
    assert res["research_findings"]["sources_indexed"] > 0

@pytest.mark.asyncio
async def test_analyzer_agent():
    analyzer = AnalyzerAgent()
    res = await analyzer.execute({"research_findings": {}}, {})
    assert res["status"] == "COMPLETED"
    assert "kpis" in res
    assert res["kpis"]["csat_score"] == 4.6

@pytest.mark.asyncio
async def test_validator_agent():
    validator = ValidatorAgent()
    res = await validator.execute({"kpis": {"csat_score": 4.6}}, {})
    assert res["status"] == "COMPLETED"
    assert res["validation"]["is_valid"] is True

@pytest.mark.asyncio
async def test_writer_agent():
    writer = WriterAgent()
    res = await writer.execute({
        "goal": "Test Goal",
        "research_findings": {"key_discoveries": ["Point 1"]},
        "kpis": {"csat_score": 4.6}
    }, {})
    assert res["status"] == "COMPLETED"
    assert "report" in res
    assert "Executive Report" in res["report"]["markdown"]
