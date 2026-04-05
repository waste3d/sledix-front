import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://sledix.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // добавь другие страницы, если есть
  ]
}