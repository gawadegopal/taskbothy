import { ListTodo, Users, Zap } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function Home() {
  const arr = [
    {
      icon: ListTodo,
      title: "Smart Planning",
      description: "Turn ideas into action with fluid, visual workflows.",
      color: "bg-[#34C759]",
    },
    {
      icon: Users,
      title: "Seamless Connection",
      description: "Bridge time zones and cultures with effortless teamwork.",
      color: "bg-[#0066CC]",
    },
    {
      icon: Zap,
      title: "Instant Response",
      description: "Every click delivers results at lightning speed.",
      color: "bg-[#FFCC00]",
    },
  ];

  return (
    <div>
      <div className="container mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#1D1D1F] mb-4">
          Organize ambition. Achieve without limits.
        </h1>

        <p className="text-xl text-[#6E6E73] mb-8 max-w-4xl mx-auto">
          TaskBothy helps teams and leaders turn vision into reality.
          Collaborate, manage projects, and unlock new productivity heights —
          from the heart of the city to anywhere in the world.
        </p>
      </div>

      <div className="text-center px-4 py-12 md:py-20 bg-[linear-gradient(180deg,#EAF3FF_0%,#F5F5F7_100%)]">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] mb-4">
          All you need to master your workflow
        </h2>

        <p className="text-xl text-[#6E6E73] max-w-2xl mx-auto">
          Streamlined tools to unite your team and deliver with elegance.
        </p>

        <div className="container mx-auto p-4 sm:p-6 grid md:grid-cols-3 gap-4 justify-center">
          {arr.map((v, i) => {
            return (
              <Card
                key={i}
                className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] transition duration-150"
              >
                <CardHeader className="text-center">
                  <div className={`h-8 w-8 sm:h-10 sm:w-10 ${v.color} rounded-lg flex items-center justify-center mx-auto mb-6`}>
                    <v.icon className="h-6 w-6 text-white" />
                  </div>

                  <CardTitle className="text-lg">
                    {v.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-center">
                    {v.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
