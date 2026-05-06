import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy — sayhii",
  description:
    "How sayhii collects, uses, and protects personal information across our website and applications.",
};

const sections: { h: string; p: (string | { quote: string })[] }[] = [
  {
    h: "Privacy Policy",
    p: [
      "sayhii (\"us\", \"we\", or \"our\") operates the https://sayhii.io website, the sayhii application, and the sayhii mobile application (the \"Service\"). This page informs you of our policies regarding the collection, use and disclosure of Personal Information when you use our Service. We will not use or share your information with anyone except as described in this Privacy Policy. We use your Personal Information for providing and improving the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.",
    ],
  },
  {
    h: "Information Collection and Use",
    p: [
      "While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to, your email address, name (\"Personal Information\").",
      "Member profile: Your member profile will remain confidential and private.",
      {
        quote:
          "Answers to the questions: All collected answers will remain anonymous to the organization and will be aggregated at a sample size of 5 or greater.",
      },
    ],
  },
  {
    h: "Log Data",
    p: [
      "When you access the Service by or through a mobile device, we may collect certain information automatically, including, but not limited to, the type of mobile device you use and your mobile operating system, and other statistics.",
      "In addition, we may use third-party services such as Google Analytics that collect, monitor, and analyze this type of information in order to increase our Service's functionality. These third-party service providers have their own privacy policies addressing how they use such information.",
    ],
  },
  {
    h: "Location Information",
    p: [
      "We DO NOT use location information to track our users. The location information is used only to narrow the search results to a specific location area.",
      "We may use and store information about your location if you give us permission to do so. We use this information to provide features of our Service, and to improve and customize our Service. You can enable or disable location services when you use our Service at any time, through your mobile device settings.",
    ],
  },
  {
    h: "Cookies and Web Beacons",
    p: [
      "Like many other websites, sayhii uses cookies to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.",
    ],
  },
  {
    h: "Service Providers",
    p: [
      "We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services or assist us in analyzing how our Service is used.",
      "These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.",
    ],
  },
  {
    h: "Business Transaction",
    p: [
      "If sayhii is involved in a merger, acquisition, or asset sale, your Personal Information may be transferred. We will provide notice before your Personal Information is transferred and becomes subject to a different Privacy Policy.",
    ],
  },
  {
    h: "Security",
    p: [
      "The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.",
    ],
  },
  {
    h: "International Transfer",
    p: [
      "Your information, including Personal Information, may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction.",
      "If you are located outside the United States and choose to provide information to us, please note that we transfer the information, including personal information, to the United States and process it there.",
      "Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.",
    ],
  },
  {
    h: "Links To Other Sites",
    p: [
      "Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third-party's site. We strongly advise you to review the Privacy Policy of every site you visit.",
      "We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.",
    ],
  },
  {
    h: "Children's Privacy",
    p: [
      "Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your children have provided us with Personal Information, please contact us.",
      "If we discover that children under 13 have provided us with Personal Information, we will delete such information from our servers immediately.",
    ],
  },
  {
    h: "Changes To This Privacy Policy",
    p: [
      "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.",
      "You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.",
    ],
  },
  {
    h: "Contact Us",
    p: [
      "If you have any questions about this Privacy Policy, please contact us at hi@sayhii.io.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        tone="sage"
        eyebrow="Privacy"
        title={
          <>
            Privacy <span className="font-serif italic">policy</span>.
          </>
        }
      />

      <section className="mx-auto max-w-3xl px-6 lg:px-10 py-16 lg:py-20">
        <div className="space-y-12">
          {sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-2xl lg:text-3xl tracking-tight font-semibold leading-snug">
                {s.h}
              </h2>
              <div className="mt-4 space-y-4 text-foreground/85 leading-relaxed">
                {s.p.map((p, i) =>
                  typeof p === "string" ? (
                    <p key={i}>{p}</p>
                  ) : (
                    <blockquote
                      key={i}
                      className="rounded-2xl border-l-4 border-primary bg-warm/40 px-5 py-4 text-foreground"
                    >
                      {p.quote}
                    </blockquote>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
