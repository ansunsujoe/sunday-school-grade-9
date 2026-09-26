import { Callout, LessonSection, Scripture } from "@/components/lesson";
import { DailyJournal, SectionTracker } from "@/components/lesson-client";
import { ContentPage } from "../content-page";

const STOPS = [
  { id: "egypt", label: "Egypt", detail: "Slavery, Moses, the plagues, the Passover", read: "Exodus 1–12" },
  { id: "red-sea", label: "The Red Sea", detail: "God parts the sea", read: "Exodus 13–15" },
  {
    id: "wilderness",
    label: "The wilderness",
    detail: "Bitter water, manna, quail, water from a rock",
    read: "Exodus 15–17",
  },
  {
    id: "sinai",
    label: "Mount Sinai",
    detail: "The Ten Commandments, the golden calf, the tabernacle",
    read: "Exodus 19–40",
  },
  { id: "kadesh", label: "Kadesh", detail: "Twelve spies, and a people too afraid to go in", read: "Numbers 13–14" },
  { id: "forty-years", label: "Forty years", detail: "Wandering, grumbling, and God's faithfulness", read: "Numbers 20–21" },
  { id: "jordan", label: "The Jordan", detail: "A new leader and the Promised Land", read: "Deuteronomy 34; Joshua 1–6" },
];

export default function JourneyOfTheIsraelitesPage() {
  return (
    <ContentPage
      slug="journey-of-the-israelites"
      aside={
        <div className="hidden lg:block">
          <SectionTracker title="The journey" stops={STOPS.map(({ id, label }) => ({ id, label }))} />
        </div>
      }
    >
      <Scripture cite="Exodus 13:21">
        By day the LORD went ahead of them in a pillar of cloud to guide them on their way and by
        night in a pillar of fire to give them light, so that they could travel by day or night.
      </Scripture>

      <div className="grid gap-4 sm:grid-cols-2">
        <Callout label="The big idea">
          God rescued his people from slavery, walked with them through the wilderness, and brought
          them home — even when they complained, doubted, and rebelled. The same God leads us today.
        </Callout>
        <Callout label="Memory verse" tone="sky">
          <em>“The LORD will fight for you; you need only to be still.”</em> — Exodus 14:14
        </Callout>
      </div>

      <h2 className="mt-8 mb-4 font-display text-2xl font-semibold text-slate-50 sm:text-3xl">
        The journey at a glance
      </h2>
      <ol className="mb-10 grid gap-2 sm:grid-cols-2">
        {STOPS.map((stop, i) => (
          <li key={stop.id}>
            <a
              href={`#${stop.id}`}
              className="group flex h-full items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition hover:border-amber-400/30 hover:bg-amber-400/[0.04]"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-night-700 text-sm font-bold text-amber-200 ring-1 ring-amber-400/20 transition group-hover:bg-amber-400 group-hover:text-night-950">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-100">{stop.label}</span>
                <span className="block text-sm text-slate-400">{stop.detail}</span>
                <span className="mt-1 block text-xs font-medium text-amber-200/70">{stop.read}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="space-y-10">
        <LessonSection id="egypt" number={1} title="Slavery in Egypt" read="Exodus 1–3; 12">
          <p>
            Joseph’s family came to Egypt as guests, but hundreds of years later a new Pharaoh
            saw them as a threat and forced them into brutal slave labor (Exodus 1:8–14). Baby Moses
            was saved from Pharaoh’s order in a basket on the Nile and raised in Pharaoh’s own
            palace.
          </p>
          <p>
            Years later, God spoke to Moses from a <strong>burning bush</strong> and sent him back to
            say, <em>“Let my people go.”</em> Pharaoh refused, and God sent ten plagues. On the night of
            the last plague, every Israelite family put the blood of a lamb on their doorframe — the
            first <strong>Passover</strong> — and death “passed over” their homes (Exodus 12:13).
          </p>
          <Callout label="Look for Jesus" tone="violet">
            Paul calls Jesus <em>“our Passover lamb”</em> (1 Corinthians 5:7). His blood rescues us,
            just as the lamb’s blood rescued Israel.
          </Callout>
        </LessonSection>

        <LessonSection id="red-sea" number={2} title="Crossing the Red Sea" read="Exodus 13–15">
          <p>
            God didn’t send Israel the short way, along the coast. He led them with a pillar of
            cloud by day and fire by night (Exodus 13:17–22). When Pharaoh changed his mind and chased
            them, they were trapped between his army and the sea.
          </p>
          <p>
            Moses told the terrified people, <em>“The LORD will fight for you; you need only to be
            still”</em> (Exodus 14:14). God split the sea, Israel walked through on dry ground, and the
            water came back over Egypt’s army. Their first response on the other side was worship —
            the Song of Moses (Exodus 15).
          </p>
        </LessonSection>

        <LessonSection id="wilderness" number={3} title="Provision in the Wilderness" read="Exodus 15:22–17:16">
          <p>Only three days after the Red Sea, the people were already complaining.</p>
          <ul>
            <li>
              <strong>Marah:</strong> The water was bitter, so God made it sweet (15:22–25).
            </li>
            <li>
              <strong>Elim:</strong> God led them to twelve springs and seventy palm trees (15:27).
            </li>
            <li>
              <strong>The Desert of Sin:</strong> They were hungry, so God sent <strong>quail</strong> in
              the evening and <strong>manna</strong> every morning — just enough for each day, and a
              double portion before the Sabbath (Exodus 16).
            </li>
            <li>
              <strong>Rephidim:</strong> There was no water, so God told Moses to strike a rock, and
              water poured out (17:1–7).
            </li>
            <li>
              <strong>Amalek attacks:</strong> Israel won while Moses held up his hands, with Aaron and
              Hur holding them up when he got tired (17:8–13).
            </li>
          </ul>
          <Callout label="Think about it" tone="sky">
            Manna couldn’t be stored up (except for the Sabbath). Why would God want his people to
            depend on him <em>one day at a time</em>? Jesus later said, <em>“I am the bread of life”</em>{" "}
            (John 6:35).
          </Callout>
        </LessonSection>

        <LessonSection id="sinai" number={4} title="Mount Sinai" read="Exodus 19–20; 32; 40">
          <p>
            At Sinai, God made a covenant with Israel and gave the <strong>Ten Commandments</strong>{" "}
            (Exodus 20). They were not a way to <em>earn</em> rescue; God gave them to people he had{" "}
            <em>already</em> rescued: <em>“I am the LORD your God, who brought you out of Egypt, out of
            the land of slavery”</em> (20:2).
          </p>
          <p>
            While Moses was on the mountain, the people made a <strong>golden calf</strong> and
            worshiped it (Exodus 32). Even so, God did not abandon them. He gave instructions for the{" "}
            <strong>tabernacle</strong>, a tent where he would live among his people, and at the end of
            Exodus his glory filled it (40:34).
          </p>
        </LessonSection>

        <LessonSection id="kadesh" number={5} title="Kadesh: The Twelve Spies" read="Numbers 13–14">
          <p>
            Israel reached the edge of the Promised Land, and Moses sent twelve spies. All twelve saw
            that the land was good. Ten said the people there were too strong: <em>“We seemed like
            grasshoppers”</em> (13:33). Only <strong>Joshua and Caleb</strong> trusted God.
          </p>
          <p>
            The people believed the ten, wept all night, and even talked about going back to Egypt.
            Because they refused to trust God, that generation would wander in the wilderness for{" "}
            <strong>forty years</strong> (14:33–34). God said Caleb had <em>“a different spirit and
            follows me wholeheartedly”</em> (14:24).
          </p>
        </LessonSection>

        <LessonSection
          id="forty-years"
          number={6}
          title="Forty Years of Wandering"
          read="Numbers 20:1–13; 21:4–9; Deuteronomy 8:2–4"
        >
          <ul>
            <li>
              <strong>Moses strikes the rock:</strong> God told Moses to <em>speak</em> to the rock, but
              in anger he struck it twice. Because of this, Moses would not enter the land (Numbers
              20:1–13).
            </li>
            <li>
              <strong>The bronze snake:</strong> When the people grumbled, venomous snakes came into the
              camp. God told Moses to put a bronze snake on a pole, and anyone who looked at it lived
              (Numbers 21:4–9). Jesus pointed to this story to describe his own cross (John 3:14–15).
            </li>
            <li>
              <strong>God’s faithfulness:</strong> In forty years, their clothes didn’t wear
              out and their feet didn’t swell (Deuteronomy 8:4).
            </li>
          </ul>
          <Scripture cite="Deuteronomy 8:2">
            Remember how the LORD your God led you all the way in the wilderness these forty years, to
            humble and test you in order to know what was in your heart, whether or not you would keep
            his commands.
          </Scripture>
        </LessonSection>

        <LessonSection id="jordan" number={7} title="Into the Promised Land" read="Deuteronomy 34; Joshua 1; 3–4; 6">
          <p>
            Moses saw the Promised Land from Mount Nebo and died there (Deuteronomy 34). God gave
            leadership to <strong>Joshua</strong> and told him, <em>“Be strong and courageous… for the
            LORD your God will be with you wherever you go”</em> (Joshua 1:9).
          </p>
          <p>
            God stopped the Jordan River at flood stage so the people could cross on dry ground, just as
            he had at the Red Sea (Joshua 3). They set up twelve stones as a memorial, so their children
            would ask, <em>“What do these stones mean?”</em> (Joshua 4:6). Then the walls of{" "}
            <strong>Jericho</strong> fell (Joshua 6).
          </p>
        </LessonSection>

        <LessonSection id="why-it-matters" title="Why this matters for us">
          <p>
            <em>“These things happened to them as examples and were written down as warnings for
            us”</em> (1 Corinthians 10:11).
          </p>
          <ol>
            <li>
              <strong>God rescues first.</strong> Israel didn’t earn freedom, and neither do we.
              Jesus is our Passover lamb.
            </li>
            <li>
              <strong>God provides daily.</strong> Manna, water, and clothes that didn’t wear out.
              God knows what you need today.
            </li>
            <li>
              <strong>Fear and grumbling can keep us wandering.</strong> The problem at Kadesh
              wasn’t the giants; it was not trusting God.
            </li>
            <li>
              <strong>Be a Caleb.</strong> Following God wholeheartedly often means disagreeing with the
              crowd.
            </li>
            <li>
              <strong>Remember.</strong> The twelve stones were there so the next generation would ask
              about God’s faithfulness. What are your “stones”?
            </li>
          </ol>
        </LessonSection>

        <LessonSection id="discussion" title="Discussion questions">
          <ol>
            <li>
              Israel saw the Red Sea split, then complained three days later. Why do we forget what God
              has done so quickly?
            </li>
            <li>
              Which stop on the journey is most like where you are right now: Egypt, the wilderness,
              Sinai, Kadesh, or the edge of the Jordan?
            </li>
            <li>What “giants” make you afraid to follow God fully? What would Caleb say to you?</li>
            <li>
              Manna came one day at a time. What would it look like to trust God one day at a time this
              week?
            </li>
            <li>What is one “memorial stone” in your life, a time God clearly came through for you?</li>
          </ol>
        </LessonSection>

        <LessonSection id="challenge" title="This week's challenge">
          <p>
            Every night this week, write down <strong>one way God provided for you that day</strong>.
            Bring your list next Sunday.
          </p>
          <DailyJournal
            storageKey="journal:journey-of-the-israelites"
            prompt="One way God provided for me today:"
          />
        </LessonSection>
      </div>
    </ContentPage>
  );
}
