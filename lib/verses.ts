import { SUNDAYS } from "@/lib/school-year";

// NIV wording. One is shown per week, cycling through the list.
const VERSES = [
  { text: "Your word is a lamp for my feet, a light on my path.", ref: "Psalm 119:105" },
  { text: "Don't let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.", ref: "1 Timothy 4:12" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "How can a young person stay on the path of purity? By living according to your word.", ref: "Psalm 119:9" },
  { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", ref: "John 3:16" },
  { text: "Remember your Creator in the days of your youth.", ref: "Ecclesiastes 12:1" },
  { text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.", ref: "Romans 12:2" },
  { text: "The Lord is my shepherd, I lack nothing.", ref: "Psalm 23:1" },
  { text: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.", ref: "Matthew 5:16" },
];

export function verseForWeek(sunday: string) {
  return VERSES[Math.max(0, SUNDAYS.indexOf(sunday)) % VERSES.length];
}
