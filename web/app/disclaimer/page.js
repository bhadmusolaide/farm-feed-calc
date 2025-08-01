'use client';

import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function Disclaimer() {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Main Content */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-8">
          {/* Title */}
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              📄 Disclaimer
            </h1>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
            Last updated: July 1, 2025
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
              This application ("Feed Calculator by Omzo Farmz") is owned and operated by Omzo Farmz. 
              The App is designed to provide general guidance and feed recommendations for poultry farmers, 
              specifically targeting users in Nigeria and other African regions.
            </p>

            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 mt-8">
              Information Accuracy
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-4">
              While we aim to provide accurate and practical recommendations, all information in the App is based on:
            </p>
            <ul className="list-disc pl-6 mb-6 text-neutral-700 dark:text-neutral-300">
              <li>General poultry farming standards</li>
              <li>Locally observed best practices</li>
              <li>Breed and feed data commonly available in Nigeria</li>
            </ul>
            <p className="text-neutral-700 dark:text-neutral-300 mb-6">
              Omzo Farmz does not guarantee that all results will be suitable for every user or farming condition.
            </p>

            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 mt-8">
              No Professional Veterinary Advice
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-6">
              The App does not replace veterinary or agricultural expert consultation. Always seek advice from 
              certified professionals before making health, feed, or treatment decisions for your birds.
            </p>

            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 mt-8">
              User Responsibility
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-4">
              By using this App:
            </p>
            <ul className="list-disc pl-6 mb-6 text-neutral-700 dark:text-neutral-300">
              <li>You agree to apply the information at your own discretion and risk.</li>
              <li>You are responsible for monitoring your birds and adjusting feeding or care based on real-life observations.</li>
              <li>Omzo Farmz will not be held liable for any losses, injuries, or poor outcomes resulting from the use of this App.</li>
            </ul>

            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 mt-8">
              External Links
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-6">
              The App may include links to feed suppliers, brands, or external content. These are provided for convenience. 
              Omzo Farmz is not responsible for their content or pricing.
            </p>

            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 mt-8">
              Updates
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-6">
              This disclaimer may change over time as the App evolves. Continued use means you agree to the most recent version.
            </p>

            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6 mt-8">
              <p className="text-neutral-700 dark:text-neutral-300 mb-2">
                For questions or feedback, contact: 
                <a 
                  href="mailto:support@omzofarmz.com" 
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium ml-1"
                >
                  support@omzofarmz.com
                </a>
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Thank you for using the app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}