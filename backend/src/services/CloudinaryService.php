<?php

class CloudinaryService
{
    private \Cloudinary\Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new \Cloudinary\Cloudinary([
            'cloud' => [
                'cloud_name' => getenv('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => getenv('CLOUDINARY_API_KEY'),
                'api_secret' => getenv('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => true,
            ],
        ]);
    }

    /**
     * Upload une image (fichier $_FILES) vers Cloudinary
     * Retourne l'URL sécurisée de l'image
     */
    public function uploadImage(array $file, string $folder = 'refuge_bibliotheque/livres'): string
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException("Erreur lors de l'upload du fichier");
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array(mime_content_type($file['tmp_name']), $allowedTypes)) {
            throw new \RuntimeException("Format d'image non supporté");
        }

        $result = $this->cloudinary->uploadApi()->upload($file['tmp_name'], [
            'folder' => $folder,
            'resource_type' => 'image',
        ]);

        return $result['secure_url'];
    }

    /**
     * Supprime une image de Cloudinary à partir de son URL
     */
    public function deleteImageByUrl(string $url): void
    {
        // Extraire le public_id depuis l'URL Cloudinary
        // Ex: https://res.cloudinary.com/xxx/image/upload/v123456/refuge_bibliotheque/livres/abc123.jpg
        $pattern = '#/upload/(?:v\d+/)?(.+)\.\w+$#';
        if (preg_match($pattern, $url, $matches)) {
            $publicId = $matches[1];
            $this->cloudinary->uploadApi()->destroy($publicId);
        }
    }
}