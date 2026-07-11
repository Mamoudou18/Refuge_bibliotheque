<?php

class Validation
{
    private array $erreurs = [];

    public function required(array $data, array $champs): self
    {
        foreach ($champs as $champ) {
            if (!isset($data[$champ]) || trim((string)$data[$champ]) === '') {
                $this->erreurs[] = "Le champ '$champ' est requis";
            }
        }
        return $this;
    }

    public function email(array $data, string $champ): self
    {
        if (!empty($data[$champ]) && !filter_var($data[$champ], FILTER_VALIDATE_EMAIL)) {
            $this->erreurs[] = "Le champ '$champ' doit être un email valide";
        }
        return $this;
    }

    public function minLength(array $data, string $champ, int $min): self
    {
        if (!empty($data[$champ]) && strlen($data[$champ]) < $min) {
            $this->erreurs[] = "Le champ '$champ' doit contenir au moins $min caractères";
        }
        return $this;
    }

    public function maxLength(array $data, string $champ, int $max): self
    {
        if (!empty($data[$champ]) && strlen($data[$champ]) > $max) {
            $this->erreurs[] = "Le champ '$champ' ne doit pas dépasser $max caractères";
        }
        return $this;
    }

    public function motDePasse(array $data, string $champ): self
    {
        if (!empty($data[$champ])) {
            $valeur = $data[$champ];
            $valid = strlen($valeur) >= 10
                && preg_match('/[a-z]/', $valeur)
                && preg_match('/[A-Z]/', $valeur)
                && preg_match('/[0-9]/', $valeur)
                && preg_match('/[^a-zA-Z0-9]/', $valeur);

            if (!$valid) {
                $this->erreurs[] = "Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
            }
        }
        return $this;
    }
    
    public function same(array $data, string $champ, string $champConfirmation): self
    {
        if (isset($data[$champ]) && isset($data[$champConfirmation])
            && $data[$champ] !== $data[$champConfirmation]) {
            $this->erreurs[] = "Le champ '$champConfirmation' doit être identique à '$champ'";
        }
        return $this;
    }

    public function phone(array $data, string $champ): self
    {
        if (!empty($data[$champ]) && !preg_match('/^[0-9+\s]{8,20}$/', $data[$champ])) {
            $this->erreurs[] = "Le champ '$champ' doit être un numéro de téléphone valide";
        }
        return $this;
    }
    public function date(array $data, string $champ, string $format = 'd/m/Y'): self
    {
        if (!empty($data[$champ])) {
            $d = DateTime::createFromFormat($format, $data[$champ]);
            $erreurs = DateTime::getLastErrors();

            $hasErrors = $erreurs !== false && ($erreurs['warning_count'] > 0 || $erreurs['error_count'] > 0);

            if (!$d || $hasErrors) {
                $this->erreurs[] = "Le champ '$champ' doit être une date valide au format jj/mm/aaaa";
            }
        }
        return $this;
    }

    public function beforeToday(array $data, string $champ, string $format = 'd/m/Y'): self
    {
        if (!empty($data[$champ])) {
            $d = DateTime::createFromFormat($format, $data[$champ]);
            if ($d && $d >= new DateTime('today')) {
                $this->erreurs[] = "Le champ '$champ' doit être une date antérieure à aujourd'hui";
            }
        }
        return $this;
    }
    
    public function fails(): bool
    {
        return count($this->erreurs) > 0;
    }

    public function getErrors(): array
    {
        return $this->erreurs;
    }
}