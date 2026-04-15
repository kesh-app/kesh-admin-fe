import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div>
        <h1 className="text-3xl font-bold">Project Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The project you are looking for does not exist.
        </p>
      </div>

      <Link href="/projects">
        <Button>Back to Projects</Button>
      </Link>
    </div>
  )
}