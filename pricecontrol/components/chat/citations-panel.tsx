"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText } from "lucide-react"

interface Citation {
  id: string
  title: string
  url?: string
  type: "web" | "document" | "data"
  snippet?: string
}

interface CitationsPanelProps {
  citations: Citation[]
}

export function CitationsPanel({ citations }: CitationsPanelProps) {
  if (citations.length === 0) {
    return null
  }

  const getIcon = (type: Citation["type"]) => {
    switch (type) {
      case "web":
        return <ExternalLink className="h-3 w-3" />
      case "document":
        return <FileText className="h-3 w-3" />
      case "data":
        return <FileText className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  const getTypeColor = (type: Citation["type"]) => {
    switch (type) {
      case "web":
        return "default"
      case "document":
        return "secondary"
      case "data":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {citations.map((citation) => (
          <div key={citation.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex-shrink-0 mt-0.5">{getIcon(citation.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium truncate">{citation.title}</h4>
                <Badge variant={getTypeColor(citation.type)} className="text-xs">
                  {citation.type}
                </Badge>
              </div>
              {citation.snippet && <p className="text-xs text-muted-foreground line-clamp-2">{citation.snippet}</p>}
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                  View source
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
