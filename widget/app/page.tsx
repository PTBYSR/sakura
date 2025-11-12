import Widget from "./widget/page";
import { Suspense } from "react";
export default function Home() {
  return (
    <div className="">
      <Suspense fallback={<div />}>
        <Widget />
      </Suspense>
    </div>
  );
}
