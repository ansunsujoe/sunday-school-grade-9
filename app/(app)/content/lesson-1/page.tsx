import { Callout, LessonSection, Scripture } from "@/components/lesson";
import { SectionTracker } from "@/components/lesson-client";
import { ContentPage } from "../content-page";

// Scripture is quoted from the KJV.

const SECTIONS = [
  { id: "deliverance", label: "Deliverance from Egypt", read: "Exodus 1–3" },
  { id: "reasons", label: "Reasons for leaving Egypt", read: "Exodus 1:14; 3:7–8, 18" },
  { id: "strong-hand", label: "The strong hand of God", read: "Exodus 7–14" },
  { id: "passover", label: "The Passover", read: "Exodus 12:1–13" },
  { id: "memory-verse", label: "Memory verse", read: "1 John 1:9" },
];

// How Israel's story pictures ours; each pair is taught in the sections below.
const TYPES = [
  { israel: "Egypt", us: "The sinful world" },
  { israel: "Slavery under Pharaoh", us: "Bondage to sin, the devil, and the world" },
  { israel: "The Passover lamb", us: "Jesus, our Passover" },
  { israel: "The blood on the doorposts", us: "Redemption through the blood of Jesus" },
  { israel: "Sacrifices in the wilderness", us: "Our lives as a living sacrifice" },
  { israel: "The Promised Land", us: "Heaven, our inheritance" },
];

export default function Lesson1Page() {
  return (
    <ContentPage
      slug="lesson-1"
      aside={
        <div className="hidden lg:block">
          <SectionTracker title="Introduction" stops={SECTIONS.map(({ id, label }) => ({ id, label }))} />
        </div>
      }
    >
      <Callout label="The big idea">
        The journey of the Israelites, out of Egypt, through the wilderness, and into the Promised
        Land, is a picture of our own journey with God: out of sin, through this life, and home to
        heaven.
      </Callout>

      <h2 className="mt-8 mb-4 font-display text-2xl font-semibold text-slate-50 sm:text-3xl">
        Their journey, our journey
      </h2>
      <div className="mb-10 overflow-hidden rounded-2xl border border-line">
        <div className="grid grid-cols-2 bg-wash text-xs font-semibold tracking-[0.15em] uppercase">
          <p className="px-4 py-2.5 text-amber-300/80">For Israel</p>
          <p className="px-4 py-2.5 text-violet-300/90">For us</p>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {TYPES.map((t) => (
            <li key={t.israel} className="grid grid-cols-2 text-base sm:text-lg">
              <span className="px-4 py-3 text-slate-300">{t.israel}</span>
              <span className="border-l border-line-subtle px-4 py-3 font-medium text-slate-50">{t.us}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-10">
        <LessonSection id="deliverance" number={1} title="Deliverance from Egypt" read="Exodus 1–3">
          <p>
            This year we are following the Israelites from slavery in Egypt to the edge of the Promised
            Land. It isn’t only history. The journey of the Israelites is a <strong>type and
            shadow</strong> of our spiritual journey: God wrote their story so we could see our own in
            it.
          </p>
          <Scripture cite="1 Corinthians 10:11">
            Now all these things happened unto them for ensamples: and they are written for our
            admonition…
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            <strong>Egypt</strong> represents the sinful world, and the <strong>Promised Land</strong>{" "}
            represents heaven. Every step between them is a picture of the Christian life.
          </Callout>
        </LessonSection>

        <LessonSection id="reasons" number={2} title="Reasons for Leaving Egypt" read="Exodus 1:14; 3:7–8, 18">
          <p>
            Why did Israel need to leave Egypt? Each of the four reasons is also a reason we need to be
            saved.
          </p>

          <h3>1. Their life was bitter through hard labor</h3>
          <Scripture cite="Exodus 1:14">
            And they made their lives bitter with hard bondage, in morter, and in brick, and in all
            manner of service in the field…
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            Just as the Israelites were slaves, we were <strong>servants to sin</strong> before we were
            saved. The love of money is one example: it pierces people “through with many sorrows” (1
            Timothy 6:10). As we serve sin, the devil can bring afflictions that make life bitter, and in
            the end, serving sin leads to death: <em>“For the wages of sin is death”</em> (Romans 6:23).
          </Callout>

          <h3>2. To be delivered from their bondage</h3>
          <Scripture cite="Exodus 3:8">
            And I am come down to deliver them out of the hand of the Egyptians…
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            Those who are not saved are in bondage to three masters:
            <ul className="mt-3 list-disc space-y-1.5 pl-6 marker:text-violet-300">
              <li>
                <strong>Sin:</strong> <em>“Whosoever committeth sin is the servant of sin”</em> (John
                8:34).
              </li>
              <li>
                <strong>The devil:</strong> Jesus came to destroy <em>“him that had the power of death,
                that is, the devil”</em> (Hebrews 2:14–15).
              </li>
              <li>
                <strong>The world:</strong> He gave himself <em>“that he might deliver us from this
                present evil world”</em> (Galatians 1:4).
              </li>
            </ul>
          </Callout>

          <h3>3. To offer sacrifices to God in the wilderness</h3>
          <Scripture cite="Exodus 3:18">
            …let us go, we beseech thee, three days’ journey into the wilderness, that we may sacrifice to
            the LORD our God.
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            We are called to offer our bodies as a <strong>living sacrifice</strong> to God, to do his
            will: <em>“present your bodies a living sacrifice, holy, acceptable unto God, which is your
            reasonable service”</em> (Romans 12:1–2).
          </Callout>

          <h3>4. To reach the Promised Land</h3>
          <Scripture cite="Exodus 3:8">
            …unto a good land and a large, unto a land flowing with milk and honey…
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            God has promised us an <strong>inheritance in his kingdom</strong>. He has given us{" "}
            <em>“exceeding great and precious promises”</em> (2 Peter 1:4).
          </Callout>
        </LessonSection>

        <LessonSection id="strong-hand" number={3} title="Israel’s Deliverance: The Strong Hand of God" read="Exodus 7–14">
          <p>
            God delivered the children of Israel by first striking Egypt with <strong>ten
            plagues</strong>. Then, when Pharaoh chased after them, God threw Pharaoh and his army into
            the <strong>Red Sea</strong>. Why did God do it this way? Scripture gives five reasons.
          </p>
          <ol>
            <li>
              <strong>That the Egyptians would know that Jehovah is God.</strong>
              <Scripture cite="Exodus 7:5">
                And the Egyptians shall know that I am the LORD, when I stretch forth mine hand upon
                Egypt…
              </Scripture>
            </li>
            <li>
              <strong>That Pharaoh would know that Jehovah is God.</strong>
              <Scripture cite="Exodus 8:10">
                …that thou mayest know that there is none like unto the LORD our God.
              </Scripture>
            </li>
            <li>
              <strong>To make a difference between the Israelites and the Egyptians.</strong> The
              plagues fell on Egypt but not on God’s people: the flies stayed out of Goshen (8:22–23),
              Israel had light in the plague of darkness (10:23), and their firstborn lived (11:7).
              <Scripture cite="Exodus 11:7">
                …that ye may know how that the LORD doth put a difference between the Egyptians and
                Israel.
              </Scripture>
            </li>
            <li>
              <strong>That the Israelites would know that Jehovah alone delivers them.</strong>
              <Scripture cite="Exodus 6:7">
                …ye shall know that I am the LORD your God, which bringeth you out from under the burdens
                of the Egyptians.
              </Scripture>
            </li>
            <li>
              <strong>To show forth his redemptive works and bring him glory.</strong>
              <Scripture cite="Exodus 14:4">
                …and I will be honoured upon Pharaoh, and upon all his host…
              </Scripture>
            </li>
          </ol>
          <Callout label="Spiritual parallel" tone="violet">
            Our salvation brings glory to God. We didn’t free ourselves any more than Israel did; the
            same strong hand that split the Red Sea is the hand that saves us.
          </Callout>
        </LessonSection>

        <LessonSection id="passover" number={4} title="Israel’s Deliverance: The Passover" read="Exodus 12:1–13">
          <p>
            The last plague was the death of the firstborn. God gave the Israelites the{" "}
            <strong>Passover</strong> so that it would not touch their homes.
          </p>
          <Scripture cite="Exodus 12:13">
            …when I see the blood, I will pass over you, and the plague shall not be upon you to destroy
            you…
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            We are the firstborn in this picture. Our fate should have been death.
          </Callout>

          <h3>A lamb for every house</h3>
          <p>Each household observed the Passover by slaying a lamb (Exodus 12:3–6).</p>
          <Callout label="Spiritual parallel" tone="violet">
            Jesus became our Passover lamb, slain for us: <em>“For even Christ our passover is sacrificed
            for us”</em> (1 Corinthians 5:7).
          </Callout>

          <h3>The blood on the door</h3>
          <p>The Israelites had to put the lamb’s blood on the posts of their doors.</p>
          <Scripture cite="Exodus 12:7">
            And they shall take of the blood, and strike it on the two side posts and on the upper door
            post of the houses…
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            We receive redemption through the blood of Jesus: <em>“In whom we have redemption through his
            blood, the forgiveness of sins”</em> (Ephesians 1:7). When we confess our sins and turn away
            from them, and accept Jesus as our personal Savior, <em>“the blood of Jesus Christ his Son
            cleanseth us from all sin”</em> (1 John 1:7–9).
          </Callout>
        </LessonSection>

        <LessonSection id="memory-verse" title="Memory verse" read="1 John 1:9">
          <Callout label="1 John 1:9 · KJV" tone="sky">
            <em>“If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.”</em>
          </Callout>
        </LessonSection>
      </div>
    </ContentPage>
  );
}
