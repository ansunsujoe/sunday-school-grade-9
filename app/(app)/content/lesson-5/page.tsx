import { Callout, LessonSection, Scripture } from "@/components/lesson";
import { SectionTracker } from "@/components/lesson-client";
import { ContentPage } from "../content-page";

// Scripture is quoted from the KJV, matching the wording of the lesson notes.

const SECTIONS = [
  { id: "leaving-sinai", label: "Leaving Sinai", place: "Wilderness of Sinai", read: "Numbers 10:11–36" },
  { id: "taberah", label: "The fire of the Lord", place: "Taberah", read: "Numbers 11:1–3" },
  { id: "kibroth-hattaavah", label: "Craving meat", place: "Kibroth-hattaavah", read: "Numbers 11:4–34" },
  { id: "hazeroth", label: "Envy against Moses", place: "Hazeroth", read: "Numbers 12" },
  { id: "spies", label: "The twelve spies", place: "Wilderness of Paran", read: "Numbers 13" },
  { id: "rebellion", label: "The people rebel", place: "Wilderness of Paran", read: "Numbers 14:1–38" },
  { id: "korah", label: "Korah’s rebellion", place: "In the wilderness", read: "Numbers 16" },
  { id: "aarons-rod", label: "Aaron’s budding rod", place: "The tabernacle", read: "Numbers 17:1–10" },
  { id: "meribah", label: "The waters of Meribah", place: "Kadesh", read: "Numbers 20:1–13" },
];

export default function Lesson5Page() {
  return (
    <ContentPage
      slug="lesson-5"
      aside={
        <div className="hidden lg:block">
          <SectionTracker
            title="Rebellion in the Wilderness"
            stops={SECTIONS.map(({ id, label, place }) => ({ id, label, detail: place }))}
          />
        </div>
      }
    >
      <Callout label="The big idea">
        Israel left Sinai with God’s law, God’s tabernacle, and God’s cloud leading them. Yet again
        and again they complained, envied, doubted, and rebelled, and again and again Moses stood
        between them and God’s judgment.
      </Callout>

      <h2 className="mt-8 mb-4 font-display text-2xl font-semibold text-slate-50 sm:text-3xl">
        The lesson at a glance
      </h2>
      <ol className="mb-10 grid gap-2 sm:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="group flex h-full items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition hover:border-amber-400/30 hover:bg-amber-400/[0.04]"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-night-700 text-sm font-bold text-amber-200 ring-1 ring-amber-400/20 transition group-hover:bg-amber-400 group-hover:text-night-950">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-100">{s.label}</span>
                <span className="block text-sm text-slate-400">{s.place}</span>
                <span className="mt-1 block text-xs font-medium text-amber-200/70">{s.read}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="space-y-10">
        <LessonSection id="leaving-sinai" number={1} title="Leaving Sinai" read="Numbers 10:11–36">
          <p>
            After nearly a year at Sinai, the Israelites left at God’s command. At Sinai they had
            received the <strong>Ten Commandments</strong>, built the <strong>tabernacle</strong>, set
            up the <strong>priesthood and sacrifices</strong>, and been organized into camps by tribe.
          </p>
          <Scripture cite="Numbers 10:11–12">
            And it came to pass on the twentieth day of the second month, in the second year, that the
            cloud was taken up from off the tabernacle of the testimony. And the children of Israel took
            their journeys out of the wilderness of Sinai; and the cloud rested in the wilderness of
            Paran.
          </Scripture>
          <p>The cloud of the Lord stayed over them by day, guiding every move they made.</p>
          <Scripture cite="Numbers 10:34">
            And the cloud of the LORD was upon them by day, when they went out of the camp.
          </Scripture>
        </LessonSection>

        <LessonSection id="taberah" number={2} title="Murmuring and the Fire of the Lord" read="Numbers 11:1–3">
          <p>
            Only <strong>three days</strong> after leaving Mount Sinai (Numbers 10:33), the people began
            to complain about their hardships.
          </p>
          <Scripture cite="Numbers 11:1">
            And when the people complained, it displeased the LORD: and the LORD heard it; and his anger
            was kindled; and the fire of the LORD burnt among them, and consumed them that were in the
            uttermost parts of the camp.
          </Scripture>
          <ul>
            <li>In fear, the people cried to Moses. He prayed for them, and the fire stopped (11:2).</li>
            <li>
              Moses named the place <strong>Taberah</strong> (“burning”), a reminder of God’s
              displeasure with their complaining (11:3).
            </li>
          </ul>
          <Callout label="Spiritual parallel" tone="violet">
            Complaining reveals ingratitude and unbelief in God’s providence.{" "}
            <em>
              “Do all things without murmurings and disputings: that ye may be blameless and harmless,
              the sons of God, without rebuke, in the midst of a crooked and perverse nation, among whom
              ye shine as lights in the world”
            </em>{" "}
            (Philippians 2:14–15).
          </Callout>
        </LessonSection>

        <LessonSection
          id="kibroth-hattaavah"
          number={3}
          title="The Craving for Meat and the Despising of Manna"
          read="Numbers 11:4–6, 10–15, 31–34"
        >
          <p>Soon after, the mixed multitude among them began to lust after meat.</p>
          <Scripture cite="Numbers 11:4–6">
            Who shall give us flesh to eat? We remember the fish, which we did eat in Egypt freely; the
            cucumbers, and the melons, and the leeks, and the onions, and the garlick: but now our soul
            is dried away: there is nothing at all, beside this manna, before our eyes.
          </Scripture>
          <ul>
            <li>
              They <strong>despised God’s provision</strong> and longed for the food of Egypt, a picture
              of a believer’s heart turning back to worldly pleasures.
            </li>
            <li>
              Then Moses complained about the Israelites’ complaining: <em>“I am not able to bear all this
              people alone, because it is too heavy for me”</em> (11:14).
            </li>
            <li>God sent quail in abundance, but judgment came with it:</li>
          </ul>
          <Scripture cite="Numbers 11:33–34">
            And while the flesh was yet between their teeth, ere it was chewed, the wrath of the LORD was
            kindled against the people, and the LORD smote the people with a very great plague. And he
            called the name of that place Kibroth-hattaavah: because there they buried the people that
            lusted.
          </Scripture>
          <p>
            <strong>Kibroth-hattaavah</strong> means “graves of lust.” There they buried the people who
            had complained about the manna and lusted after the quail.
          </p>
          <Callout label="Spiritual parallel" tone="violet">
            When we demand what God has not willed, he may allow it, but it will drain our spiritual
            life. Ingratitude leads to lust, and lust leads to judgment.
          </Callout>
        </LessonSection>

        <LessonSection id="hazeroth" number={4} title="Envy Against Moses" read="Numbers 12">
          <p>
            At <strong>Hazeroth</strong>, Miriam and Aaron began to speak against Moses because he had
            married an Ethiopian woman. Underneath, they were jealous of his authority.
          </p>
          <Scripture cite="Numbers 12:1–2">
            And Miriam and Aaron spake against Moses because of the Ethiopian woman whom he had married:
            for he had married an Ethiopian woman. And they said, Hath the LORD indeed spoken only by
            Moses? hath he not spoken also by us? And the LORD heard it.
          </Scripture>
          <ul>
            <li>The Lord suddenly called all three of them to the tabernacle of the congregation.</li>
            <li>
              God affirmed Moses as his faithful servant: <em>“With him will I speak mouth to mouth…
              wherefore then were ye not afraid to speak against my servant Moses?”</em> (12:8).
            </li>
            <li>God’s anger was kindled against Miriam and Aaron, and Miriam became a leper.</li>
            <li>
              Aaron confessed their sin, and Moses prayed earnestly for his sister:{" "}
              <em>“Heal her now, O God, I beseech thee”</em> (12:13).
            </li>
            <li>
              God healed Miriam but had her shut out of the camp for seven days, and the Israelites
              stayed at Hazeroth until she returned.
            </li>
          </ul>
          <Callout label="Spiritual parallel" tone="violet">
            Envy and rebellion against God’s ordained leadership bring spiritual uncleanness.
          </Callout>
        </LessonSection>

        <LessonSection id="spies" number={5} title="The Mission of the Twelve Spies" read="Numbers 13">
          <p>
            From the wilderness of Paran, God told Moses to send twelve men, one from each tribe, to spy
            out the land of Canaan. They went as far as Hebron and the valley of Eshcol.
          </p>
          <Scripture cite="Numbers 13:23">
            And they came unto the brook of Eshcol, and cut down from thence a branch with one cluster of
            grapes, and they bare it between two upon a staff; and they brought of the pomegranates, and
            of the figs.
          </Scripture>
          <p>
            After forty days they returned. <strong>Ten spies</strong> gave a bad report: the enemies
            were powerful, and there were giants who made the Israelites look like grasshoppers.
          </p>
          <Scripture cite="Numbers 13:33">
            And there we saw the giants, the sons of Anak, which come of the giants: and we were in our
            own sight as grasshoppers, and so we were in their sight.
          </Scripture>
          <p>
            Two of the spies, <strong>Joshua and Caleb</strong>, trusted God and urged the people to go
            up and take the land, because God was on their side.
          </p>
          <Scripture cite="Numbers 13:30">
            And Caleb stilled the people before Moses, and said, Let us go up at once, and possess it;
            for we are well able to overcome it.
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            Unbelief keeps us out of God’s promises:{" "}
            <em>“So we see that they could not enter in because of unbelief”</em> (Hebrews 3:19). Many
            believers see the promise but are defeated by fear instead of walking by faith.
          </Callout>
        </LessonSection>

        <LessonSection
          id="rebellion"
          number={6}
          title="The People’s Rebellion and God’s Judgment"
          read="Numbers 14:1–38"
        >
          <p>The congregation wept all night and murmured against Moses and Aaron.</p>
          <Scripture cite="Numbers 14:2, 4">
            Would God that we had died in the land of Egypt! or would God we had died in this wilderness!
            … And they said one to another, Let us make a captain, and let us return into Egypt.
          </Scripture>
          <p>
            Joshua and Caleb tore their clothes and pleaded with the people to trust the Lord, but the
            crowd wanted to stone them.
          </p>
          <Scripture cite="Numbers 14:8–9">
            If the LORD delight in us, then he will bring us into this land, and give it us; a land which
            floweth with milk and honey. Only rebel not ye against the LORD, neither fear ye the people of
            the land; for they are bread for us: their defence is departed from them, and the LORD is with
            us: fear them not.
          </Scripture>
          <ul>
            <li>Then the glory of the Lord appeared in the tabernacle.</li>
            <li>
              Moses interceded for the people once again. God pardoned them (14:20) but declared that the
              unbelieving generation would die in the wilderness over <strong>forty years</strong>, one
              year for each day the spies had searched the land (14:34).
            </li>
            <li>
              The ten spies who brought the evil report died by a plague before the Lord (14:37).
            </li>
          </ul>
          <Scripture cite="Numbers 14:24">
            But my servant Caleb, because he had another spirit with him, and hath followed me fully, him
            will I bring into the land whereinto he went; and his seed shall possess it.
          </Scripture>
          <Callout label="Spiritual parallel" tone="violet">
            Unbelief leads to wandering, but faith leads to inheritance. Joshua and Caleb represent the
            victorious remnant who wholly follow the Lord.
          </Callout>
        </LessonSection>

        <LessonSection
          id="korah"
          number={7}
          title="The Rebellion of Korah, Dathan, and Abiram"
          read="Numbers 16"
        >
          <p>
            Later, Korah, with Dathan, Abiram, and 250 well-known leaders, rose up against Moses and
            Aaron and accused Moses of exalting himself.
          </p>
          <Scripture cite="Numbers 16:3">
            Ye take too much upon you, seeing all the congregation are holy, every one of them, and the
            LORD is among them: wherefore then lift ye up yourselves above the congregation of the LORD?
          </Scripture>
          <p>
            They said they were unhappy that Moses and Aaron had put themselves over the people, but in
            truth they wanted the priesthood for themselves: <em>“and seek ye the priesthood also?”</em>{" "}
            (16:10).
          </p>
          <ul>
            <li>
              Moses fell on his face and said, <em>“Even to morrow the LORD will shew who are his”</em>{" "}
              (16:5). He told Korah and his followers that they were really fighting against the Lord
              (16:11).
            </li>
            <li>Moses declared how everyone would know who God had sent:</li>
          </ul>
          <Scripture cite="Numbers 16:29–30">
            If these men die the common death of all men… then the LORD hath not sent me. But if the LORD
            make a new thing, and the earth open her mouth, and swallow them up, with all that appertain
            unto them, and they go down quick into the pit; then ye shall understand that these men have
            provoked the LORD.
          </Scripture>
          <ul>
            <li>The earth opened and swallowed the rebels alive (16:31–33).</li>
            <li>
              The next day, the Israelites grumbled that Moses had <em>“killed the people of the
              LORD”</em> (16:41). The Lord was ready to destroy them all, but Moses and Aaron interceded,
              and Aaron <em>“stood between the dead and the living; and the plague was stayed”</em>{" "}
              (16:48).
            </li>
          </ul>
          <Callout label="Spiritual parallel" tone="violet">
            Pride in ministry leads to destruction. True authority comes only by God’s calling, not by
            ambition.
          </Callout>
        </LessonSection>

        <LessonSection id="aarons-rod" number={8} title="Aaron’s Budding Rod" read="Numbers 17:1–10">
          <p>
            To silence the murmuring for good, God commanded the leader of each tribe to bring a rod, one
            for each tribe, and lay them before the Ark of the Covenant.
          </p>
          <Scripture cite="Numbers 17:8">
            And it came to pass, that on the morrow Moses went into the tabernacle of witness; and,
            behold, the rod of Aaron for the house of Levi was budded, and brought forth buds, and bloomed
            blossoms, and yielded almonds.
          </Scripture>
          <p>
            This was God’s confirmation of Aaron’s leadership over the priesthood. The rod was kept
            before the testimony <em>“for a token against the rebels”</em> (17:10). It became one of the
            objects kept in the ark in the Most Holy Place, along with the Ten Commandments and a pot of
            manna (Hebrews 9:4).
          </p>
          <Callout label="Spiritual parallel" tone="violet">
            Servants of God are appointed by God. We should submit to them and not question their
            authority.
          </Callout>
        </LessonSection>

        <LessonSection id="meribah" number={9} title="Kadesh: The Waters of Meribah" read="Numbers 20:1–13">
          <ul>
            <li>At Kadesh, Miriam died and was buried.</li>
            <li>The people were thirsty again and complained bitterly against Moses.</li>
            <li>
              God commanded Moses to <strong>speak</strong> to the rock in front of the congregation
              (20:8).
            </li>
          </ul>
          <Scripture cite="Numbers 20:10–11">
            And Moses and Aaron gathered the congregation together before the rock, and he said unto them,
            Hear now, ye rebels; must we fetch you water out of this rock? And Moses lifted up his hand,
            and with his rod he smote the rock twice: and the water came out abundantly, and the
            congregation drank, and their beasts also.
          </Scripture>
          <p>
            Water still gushed out by God’s mercy, but Moses had disobeyed. Because of it, he would not
            enter the Promised Land.
          </p>
          <Scripture cite="Numbers 20:12">
            And the LORD spake unto Moses and Aaron, Because ye believed me not, to sanctify me in the
            eyes of the children of Israel, therefore ye shall not bring this congregation into the land
            which I have given them.
          </Scripture>
        </LessonSection>

        <LessonSection id="memory-verse" title="Memory verse" read="1 Corinthians 10:11–12">
          <Callout label="1 Corinthians 10:11–12 · KJV" tone="sky">
            <em>“Now all these things happened unto them for ensamples: and they are written for our admonition, upon whom the ends of the world are come. Wherefore let him that thinketh he standeth take heed lest he fall.”</em>
          </Callout>
        </LessonSection>
      </div>
    </ContentPage>
  );
}
