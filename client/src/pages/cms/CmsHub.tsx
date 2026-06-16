import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Info, Image, Palette, CreditCard, FileText, Settings, ArrowRight, Clock } from 'lucide-react';

const CmsHub = () => {
  const modules = [
    {
      title: 'Banner Management',
      description: 'Manage homepage hero banners, mobile banners, subtitles, descriptions, and CTA links.',
      path: '/admin/cms/banners',
      icon: <Layers className="h-6 w-6 text-amber-500" />,
      color: 'border-amber-500/20 bg-amber-500/5'
    },
    {
      title: 'About Us Section',
      description: 'Update the main story content, showcase images, and the chronological timeline journey milestones.',
      path: '/admin/cms/about',
      icon: <Info className="h-6 w-6 text-blue-500" />,
      color: 'border-blue-500/20 bg-blue-500/5'
    },
    {
      title: 'Gallery Management',
      description: 'Upload, delete, and reorder multiple portfolio items organized by custom title/category.',
      path: '/admin/cms/gallery',
      icon: <Image className="h-6 w-6 text-emerald-500" />,
      color: 'border-emerald-500/20 bg-emerald-500/5'
    },
    {
      title: 'Category Management',
      description: 'Configure slugs, titles, and cover images to structure the dynamic product collection.',
      path: '/admin/cms/categories',
      icon: <Palette className="h-6 w-6 text-purple-500" />,
      color: 'border-purple-500/20 bg-purple-500/5'
    },
    {
      title: 'Product Catalog',
      description: 'Manage name, price, short descriptions, and badges. Flag items to show on public home page.',
      path: '/admin/cms/products',
      icon: <CreditCard className="h-6 w-6 text-rose-500" />,
      color: 'border-rose-500/20 bg-rose-500/5'
    },
    {
      title: 'Instagram Gallery',
      description: 'Curate your social feed by adding post links, captions, and adjusting custom display order.',
      path: '/admin/cms/instagram',
      icon: <CreditCard className="h-6 w-6 text-pink-500" />,
      color: 'border-pink-500/20 bg-pink-500/5'
    },
    {
      title: 'Testimonials',
      description: 'Review and manage customer ratings, testimonials, name designations, and active toggles.',
      path: '/admin/cms/testimonials',
      icon: <FileText className="h-6 w-6 text-indigo-500" />,
      color: 'border-indigo-500/20 bg-indigo-500/5'
    },
    {
      title: 'Site Settings',
      description: 'Configure website logos, branding, contact details, social links, SEO tags, and footer copyright.',
      path: '/admin/cms/settings',
      icon: <Settings className="h-6 w-6 text-zinc-500" />,
      color: 'border-zinc-500/20 bg-zinc-500/5'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management System</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">
          Dynamically configure and update all customer-facing content on the main website.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((m) => (
          <Link
            key={m.title}
            to={m.path}
            className={`flex flex-col p-6 rounded-xl border ${m.color} hover:shadow-lg hover:border-transparent transition-all duration-300 group hover:-translate-y-1 bg-white dark:bg-zinc-900`}
          >
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-700 w-fit">
              {m.icon}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-4 group-hover:text-amber-500 transition-colors">
              {m.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 flex-grow leading-relaxed">
              {m.description}
            </p>
            <div className="flex items-center text-xs font-bold text-amber-500 uppercase tracking-wider mt-6 group-hover:translate-x-1 transition-transform">
              Manage <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CmsHub;
