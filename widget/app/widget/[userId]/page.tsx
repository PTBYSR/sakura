/**
 * User-specific widget route: /widget/[userId]
 * 
 * This route creates a personalized widget for each authenticated user.
 * When messages are sent, they create chat instances tied to the userId.
 */
'use client';

import Widget from "../page";
import { Suspense } from "react";

export default function UserWidgetPage() {
  // The inner Widget page reads userId from params/searchParams itself
  return (
    <Suspense fallback={<div />}> 
      <Widget />
    </Suspense>
  );
}
 
