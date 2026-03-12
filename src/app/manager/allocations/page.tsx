"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
}

interface Allocation {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}

// compute week boundaries for current month (four weeks of 7 days starting on 1st)
function getWeeksForMonth(date: Date) {
  const weeks: { start: Date; end: Date }[] = [];
  const year = date.getFullYear();
  const month = date.getMonth();
  let start = new Date(year, month, 1);
  for (let i = 0; i < 4; i++) {
    const end = new Date(year, month, 1 + 7 * (i + 1) - 1);
    weeks.push({ start: new Date(start), end: new Date(end) });
    start = new Date(year, month, 1 + 7 * (i + 1));
  }
  return weeks;
}

export default function AllocationsSummary() {
  const [users, setUsers] = useState<User[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [uRes, aRes] = await Promise.all([fetch('/api/users'), fetch('/api/allocations')]);
      if (uRes.ok) {
        const data = await uRes.json();
        setUsers(data.users || []);
      }
      if (aRes.ok) {
        const data = await aRes.json();
        setAllocations(data.allocations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <p>Loading allocation data...</p>;
  }

  const weeks = getWeeksForMonth(new Date());

  const summary = users.map((u) => {
    const weekPercents = weeks.map((w) => {
      let total = 0;
      const daysInWeek = Math.ceil((w.end.getTime() - w.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      allocations
        .filter((a) => a.userId === u.id)
        .forEach((a) => {
          const s = new Date(a.startDate);
          const e = new Date(a.endDate);
          const overlapStart = s > w.start ? s : w.start;
          const overlapEnd = e < w.end ? e : w.end;
          if (overlapStart <= overlapEnd) {
            const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            total += (a.allocationPercentage * overlapDays) / daysInWeek;
          }
        });
      return Math.min(Math.round(total), 100);
    });
    return { user: u, weekPercents };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Weekly Allocation Summary</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="border px-2 py-1">User</th>
            {weeks.map((w, idx) => (
              <th key={idx} className="border px-2 py-1">Week {idx + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summary.map((row) => (
            <tr key={row.user.id} className="odd:bg-surface even:bg-muted/10">
              <td className="border px-2 py-1">{row.user.username}</td>
              {row.weekPercents.map((p, idx) => (
                <td
                  key={idx}
                  className={`border px-2 py-1 ${p === 0 ? 'text-red-600 font-semibold' : ''}`}
                >
                  {p}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
