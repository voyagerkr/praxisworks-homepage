export type Framework = 'CrewAI' | 'AutoGen' | 'Agno' | 'LangGraph'

export interface AgentProject {
  /** stable slug derived from the name */
  id: string
  /** project / use-case name, e.g. "HIA (Health Insights Agent)" */
  name: string
  /** one-line description */
  description: string
  /** raw industry label from the upstream catalog (shown on the card) */
  industry: string
  /** normalized industry bucket used for filtering */
  category: string
  /** framework the example is built with, or null for industry showcases */
  framework: Framework | null
  /** GitHub repo or notebook link */
  url: string
}
