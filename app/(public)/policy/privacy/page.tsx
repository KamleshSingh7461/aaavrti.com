
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Ournika',
    description: 'Read our privacy policy.',
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4 text-center border-b border-border pb-8">
                <h1 className="text-3xl md:text-4xl font-serif font-medium">Privacy Policy</h1>
                <p className="text-muted-foreground">Last updated: December 2024</p>
            </div>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>At <strong>Ournika Private Limited</strong>, we value your trust & respect your privacy. This Privacy Policy provides you with details about the manner in which your data is collected, stored & used by us. You are advised to read this Privacy Policy carefully. By downloading and using our application/ website/WAP site you expressly give us consent to use & disclose your personal information in accordance with this Privacy Policy.</p>

                <h3 className="text-foreground font-semibold text-lg">Note:</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Our privacy policy may change at any time without prior notification. To make sure that you are aware of any changes, kindly review this policy periodically.</li>
                    <li>By visiting this Website you agree to be bound by the terms and conditions of this Privacy Policy. If you do not agree please do not use or access our Website.</li>
                </ul>

                <h3 className="text-foreground font-semibold text-lg">General</h3>
                <p>We will not sell, share or rent your personal information to any 3rd party or use your email address/mobile number for unsolicited emails and/or SMS. Any emails and/or SMS sent by us will only be in connection with the provision of agreed services & products and this Privacy Policy.</p>

                <h3 className="text-foreground font-semibold text-lg">Personal Information</h3>
                <p>Personal Information means and includes all information that can be linked to a specific individual or to identify any individual, such as name, address, mailing address, telephone number, email ID, credit card number, cardholder name, card expiration date, information about your mobile phone, DTH service, data card, electricity connection, Smart Tags and any details that may have been voluntarily provided by the user in connection with availing any of the services on Ournika.</p>
            </div>
        </div>
    );
}
