// ============================================================
//  WORK PAGE — Grid of all projects
// ============================================================

import { projects } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";

export const metadata = {
  title: "Work",
  description: "Projects and production systems I've engineered.",
};

export default function WorkPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-12 pb-16">
      <SectionHeader
        label="// projects"
        title="Work & Projects"
        subtitle="Production systems and personal projects I've engineered"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}
