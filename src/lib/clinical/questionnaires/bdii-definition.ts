export type Bdi2Option = { value: number; label: string };
export type Bdi2Item = { key: string; title: string; options: Bdi2Option[] };

export const BDI2_CODE = "bdii";
export const BDI2_VERSION = 1;
export const BDI2_NAME = "Beck Depression Inventory-II";
export const BDI2_MAX_SCORE = 63;

export const BDI2_INSTRUCTIONS =
  "This questionnaire consists of 21 groups of statements. Please read each group of statements carefully, then pick out one statement in each group which best describes the way you have been feeling the PAST TWO WEEKS, including TODAY. If several statements in the group seem to apply equally well, pick the highest number for that group.";

export const BDI2_ITEMS: Bdi2Item[] = [
  { key: "q1", title: "1. Sadness", options: [
    { value: 0, label: "I do not feel sad." },
    { value: 1, label: "I feel sad much of the time." },
    { value: 2, label: "I am sad all the time." },
    { value: 3, label: "I am so sad and unhappy that I can't stand it." },
  ]},
  { key: "q2", title: "2. Pessimism", options: [
    { value: 0, label: "I am not discouraged about my future." },
    { value: 1, label: "I feel more discouraged about my future than I used to." },
    { value: 2, label: "I do not expect things to work out for me." },
    { value: 3, label: "I feel my future is hopeless and will only get worse." },
  ]},
  { key: "q3", title: "3. Past Failure", options: [
    { value: 0, label: "I do not feel like a failure." },
    { value: 1, label: "I have failed more than I should have." },
    { value: 2, label: "As I look back, I see a lot of failures." },
    { value: 3, label: "I feel I am a total failure as a person." },
  ]},
  { key: "q4", title: "4. Loss of Pleasure", options: [
    { value: 0, label: "I get as much pleasure as I ever did from the things I enjoy." },
    { value: 1, label: "I don't enjoy things as much as I used to." },
    { value: 2, label: "I get very little pleasure from the things I used to enjoy." },
    { value: 3, label: "I can’t get any pleasure from the things I used to enjoy." },
  ]},
  { key: "q5", title: "5. Guilty Feelings", options: [
    { value: 0, label: "I don't feel particularly guilty." },
    { value: 1, label: "I feel guilty over many things I have done or should have done." },
    { value: 2, label: "I feel quite guilty most of the time." },
    { value: 3, label: "I feel guilty all of the time." },
  ]},
  { key: "q6", title: "6. Punishment Feelings", options: [
    { value: 0, label: "I don't feel I am being punished." },
    { value: 1, label: "I feel I may be punished." },
    { value: 2, label: "I expect to be punished." },
    { value: 3, label: "I feel I am being punished." },
  ]},
  { key: "q7", title: "7. Changes in Sleeping Pattern", options: [
    { value: 0, label: "I have not experienced any change in my sleep pattern." },
    { value: 1, label: "I sleep somewhat more than usual." },
    { value: 1, label: "I sleep somewhat less than usual." },
    { value: 2, label: "I sleep a lot more than usual." },
    { value: 2, label: "I sleep a lot less than usual." },
    { value: 3, label: "I sleep most of the day." },
    { value: 3, label: "I wake up 1–2 hours early and can’t get back to sleep." },
  ]},
  { key: "q8", title: "8. Self-Criticalness", options: [
    { value: 0, label: "I don't criticize or blame myself more than usual." },
    { value: 1, label: "I am more critical of myself than I used to be." },
    { value: 2, label: "I criticize myself for all of my faults." },
    { value: 3, label: "I blame myself for everything bad that happens." },
  ]},
  { key: "q9", title: "9. Suicidal Thoughts or Wishes", options: [
    { value: 0, label: "I don't have any thoughts of killing myself." },
    { value: 1, label: "I have thoughts of killing myself, but I would not carry them out." },
    { value: 2, label: "I would like to kill myself." },
    { value: 3, label: "I would kill myself if I had the chance." },
  ]},
  { key: "q10", title: "10. Crying", options: [
    { value: 0, label: "I don't cry any more than I used to." },
    { value: 1, label: "I cry more now than I used to." },
    { value: 2, label: "I cry over every little thing." },
    { value: 3, label: "I feel like crying, but I can’t." },
  ]},
  { key: "q11", title: "11. Agitation", options: [
    { value: 0, label: "I am no more restless or wound up than usual." },
    { value: 1, label: "I feel more restless or wound up than usual." },
    { value: 2, label: "I am so restless or agitated that it’s hard to stay still." },
    { value: 3, label: "I am so restless or agitated that I have to keep moving or doing something." },
  ]},
  { key: "q12", title: "12. Loss of Interest", options: [
    { value: 0, label: "I have not lost interest in other people or activities." },
    { value: 1, label: "I am less interested in other people or things than before." },
    { value: 2, label: "I have lost most of my interest in other people or things." },
    { value: 3, label: "It’s hard to get interested in anything." },
  ]},
  { key: "q13", title: "13. Indecisiveness", options: [
    { value: 0, label: "I make decisions about as well as ever." },
    { value: 1, label: "I find it more difficult to make decisions than usual." },
    { value: 2, label: "I have greater difficulty in making decisions than before." },
    { value: 3, label: "I have trouble making any decisions." },
  ]},
  { key: "q14", title: "14. Worthlessness", options: [
    { value: 0, label: "I do not feel I am worthless." },
    { value: 1, label: "I don’t consider myself as worthwhile and useful as before." },
    { value: 2, label: "I feel more worthless as compared to other people." },
    { value: 3, label: "I feel utterly worthless." },
  ]},
  { key: "q15", title: "15. Loss of Energy", options: [
    { value: 0, label: "I have as much energy as ever." },
    { value: 1, label: "I have less energy than I used to have." },
    { value: 2, label: "I don’t have enough energy to do very much." },
    { value: 3, label: "I don’t have enough energy to do anything." },
  ]},
  { key: "q16", title: "16. Self-Dislike", options: [
    { value: 0, label: "I feel the same about myself as ever." },
    { value: 1, label: "I have lost confidence in myself." },
    { value: 2, label: "I am disappointed in myself." },
    { value: 3, label: "I dislike myself." },
  ]},
  { key: "q17", title: "17. Irritability", options: [
    { value: 0, label: "I am no more irritable than usual." },
    { value: 1, label: "I am more irritable than usual." },
    { value: 2, label: "I am much more irritable than usual." },
    { value: 3, label: "I am irritable all the time." },
  ]},
  { key: "q18", title: "18. Changes in Appetite", options: [
    { value: 0, label: "I have not experienced any change in my appetite." },
    { value: 1, label: "My appetite is somewhat less than usual." },
    { value: 1, label: "My appetite is somewhat greater than usual." },
    { value: 2, label: "My appetite is much less than before." },
    { value: 2, label: "My appetite is much greater than before." },
    { value: 3, label: "I have no appetite at all." },
    { value: 3, label: "I crave food all the time." },
  ]},
  { key: "q19", title: "19. Concentration Difficulty", options: [
    { value: 0, label: "I can concentrate as well as ever." },
    { value: 1, label: "I cannot concentrate as well as usual." },
    { value: 2, label: "It’s hard to keep my mind on anything for very long." },
    { value: 3, label: "I find I can’t concentrate on anything." },
  ]},
  { key: "q20", title: "20. Tiredness or Fatigue", options: [
    { value: 0, label: "I am no more tired or fatigued than usual." },
    { value: 1, label: "I get more tired or fatigued more easily than usual." },
    { value: 2, label: "I am too tired or fatigued to do a lot of the things I used to." },
    { value: 3, label: "I am too tired or fatigued to do most of the things I used to." },
  ]},
  { key: "q21", title: "21. Loss of Interest in Sex", options: [
    { value: 0, label: "I have not noticed any recent change in my interest in sex." },
    { value: 1, label: "I am less interested in sex than I used to be." },
    { value: 2, label: "I am much less interested in sex now." },
    { value: 3, label: "I have lost interest in sex completely." },
  ]},
];
