import Image from "next/image";
import { PageBanner } from "@/components/PageBanner";
import { SiteChrome } from "@/components/SiteChrome";
import { Section } from "@/components/ui";
import { MEDIA } from "@/lib/media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Psychiatrist in BC | TMS & ketamine treatment – NeuroLinks",
  description:
    "NeuroLinks in Nanaimo offers expert psychiatric care, TMS therapy, and ketamine treatment for depression & OCD. Book a consultation today.",
  path: "/psychiatrist-tms-nanaimo/",
});

function Person({
  name,
  role,
  src,
  alt,
  children,
}: {
  name: string;
  role: string;
  src: string;
  alt: string;
  children: React.ReactNode;
}) {
  return (
    <article className="grid gap-6 border-t border-slate-200 py-10 md:grid-cols-[minmax(0,240px)_1fr]">
      <Image
        src={src}
        alt={alt}
        width={400}
        height={400}
        sizes={IMG_SIZES.staff}
        className="rounded object-cover"
      />
      <div>
        <h3 className="font-serif text-2xl font-bold">{name}</h3>
        <p className="text-sm text-slate-600">{role}</p>
        <div className="mt-4 space-y-3 leading-relaxed">{children}</div>
      </div>
    </article>
  );
}

export default function AboutUsPage() {
  return (
    <SiteChrome>
      <PageBanner src={MEDIA.aboutBanner} alt="" objectPosition="center -80px" />
      <Section>
        <h1 className="font-serif text-4xl font-bold">About Us</h1>
        <p className="mt-6 max-w-3xl leading-relaxed">
          NeuroLinks was founded by our psychiatrist Dr. Au in Nanaimo, located in Central
          Vancouver Island in British Columbia.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed">
          NeuroLinks aims to improve mental wellbeing and quality of life for patients
          struggling with mental disorders. We understand that medication is not the only
          answer for many patients. We believe in patient autonomy and tailoring your
          healthcare to your needs, and offer transcranial magnetic stimulation (TMS) as an
          aid in enhancing your recovery or as an alternative to unsuccessful treatments.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed">
          NeuroLinks is extending its scope beyond TMS by introducing ketamine therapy and
          plans to introduce even more innovative treatments to support our patients.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Image
            alt="Reception area"
            src={MEDIA.reception}
            width={768}
            height={512}
            className="rounded object-cover"
            sizes={IMG_SIZES.third}
          />
          <Image
            alt="NeuroLinks Office"
            src={MEDIA.office}
            width={768}
            height={512}
            className="rounded object-cover"
            sizes={IMG_SIZES.third}
          />
          <Image
            alt="TMS machine"
            src={MEDIA.tmsMachine}
            width={768}
            height={512}
            className="rounded object-cover"
            sizes={IMG_SIZES.third}
          />
        </div>
        <Person
          name="Dr Chi Hung Au"
          role="Psychiatrist"
          alt="Psychiatrist Dr Chi Hung, Au"
          src={MEDIA.drAu}
        >
          <p>
            Dr. Chi Hung Au is a psychiatrist with extensive experience in treating complex
            and treatment-resistant mental health conditions, with a particular focus on
            neuropsychiatric and neuromodulation-based approaches.
          </p>
          <p>
            He received his medical education at the Chinese University of Hong Kong and
            pursued advanced training in neuroscience and biological psychiatry, including
            formal TMS training at Harvard University and a Master of Science degree from the
            University of Oxford.
          </p>
          <p>
            Prior to moving to Canada, Dr. Au helped establish the Transcranial Magnetic
            Stimulation (TMS) centre at Queen Mary Hospital, a major teaching hospital
            affiliated with the University of Hong Kong. This experience informed his
            clinical approach to integrating pharmacotherapy with neuromodulation in
            real-world practice.
          </p>
          <p>
            After relocating to British Columbia, Dr. Au recognized a significant gap in
            access to advanced neuropsychiatric treatments for patients who do not respond
            adequately to conventional therapies. He founded NeuroLinks to provide
            evidence-based neuromodulation and neuropsychiatric care tailored to individual
            patient needs.
          </p>
          <p>
            Dr. Au is committed to medical education and serves as a Clinical Assistant
            Professor at the University of British Columbia.
          </p>
          <p>
            Outside of clinical work, he has a longstanding interest in traditional Sanshin
            and Shamisen music.
          </p>
        </Person>
        <Person
          name="Julie"
          role="TMS Technician"
          alt="0N4A2683 e1712356908228"
          src={MEDIA.julie}
        >
          <p>
            Julie has recently graduated with a Bachelor of Science in biology with a
            specialty in Microbiology. She is passionate about helping people improve their
            well-being using her education and life experiences. This is why she was thrilled
            to join Dr. Au’s team to assist with TMS treatment. Over the past two years, she
            has worked as a health and wellness program leader at Vancouver Island University.
            Julie loves to spend time with people, biking, climbing, playing guitar and
            singing.
          </p>
        </Person>
        <Person
          name="Hannah"
          role="TMS Technician"
          alt="Medical Technician Hannah"
          src={MEDIA.hannah}
        >
          <p>
            Hannah completed her Bachelor of Arts Majoring in Psychology and her Addiction
            Studies Certificate in 2022. She is passionate about pursuing a career in Clinical
            Counselling and aims to create an environment for patients that is safe,
            authentic, non-judgmental, and empathetic. In her free time, Hannah actively
            practices yoga and meditation, enjoys spending time in nature, and is a music
            enthusiast.
          </p>
        </Person>
        <Person
          name="Laura-Lee"
          role="Registered Nurse"
          alt="Registered nurse Lauralee"
          src={MEDIA.lauralee}
        >
          <p>
            Laura-Lee is a Registered Nurse with a Bachelor of Science in Nursing from
            Dalhousie University. With 14 years of experience, she has worked with clients of
            all ages across diverse settings, including adolescent substance use, in-patient
            psychiatry, psychiatric emergency, eating disorders, and complex pediatric care.
            Laura-Lee is dedicated to guiding individuals toward new paths of healing as part
            of her consultation work with clients undergoing ketamine treatments. She provides
            trauma-informed, evidence-based, and non-judgmental care, emphasizing the
            importance of safe and supportive therapeutic relationships. Originally from Nova
            Scotia, Laura-Lee now lives in British Columbia, where she enjoys adventuring with
            her daughter, family, and close friends.
          </p>
        </Person>
      </Section>
    </SiteChrome>
  );
}
