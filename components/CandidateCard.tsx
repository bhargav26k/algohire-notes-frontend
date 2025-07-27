'use client'

import { Candidate } from '@/types/candidate'
import Link from 'next/link'

export default function CandidateCard({
  candidate,
}: {
  candidate: Candidate
}) {
  // Compute initials from name
  const initials = candidate.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Link href={`/candidates/${candidate.id}/notes`} passHref>
      <div className="
        bg-white border border-gray-200
        p-6 rounded-2xl shadow-sm
        hover:shadow-lg transition-shadow duration-200
        cursor-pointer flex flex-col justify-between
      ">
        {/* Top: Avatar + Info */}
        <div className="flex items-center mb-4">
          <div className="
            w-12 h-12 rounded-full
            bg-indigo-100 text-indigo-600
            flex items-center justify-center
            font-semibold text-lg
          ">
            {initials}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              {candidate.name}
            </h3>
            <p className="text-sm text-gray-500">{candidate.email}</p>
            {/* <p className="text-xs text-gray-400 mt-1">
              ID: {candidate.id}
            </p> */}
          </div>
        </div>

        {/* Bottom: Call to action */}
        <div className="pt-4 border-t border-gray-100 text-sm text-gray-600">
          View notes & timeline →
        </div>
      </div>
    </Link>
  )
}
