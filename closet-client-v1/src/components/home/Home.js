import React from 'react'
import Hero from '../hero/Hero'

export default function Home({closets, loading, error}) {
  if (loading) {
    return <p className="text-center mt-5">Loading closets...</p>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  if (!closets.length) {
    return <p className="text-center mt-5">No closets found yet.</p>;
  }

  return (
    <Hero closets={closets}></Hero>
  )
}
