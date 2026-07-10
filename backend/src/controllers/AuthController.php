<?php

require_once __DIR__ . '/../models/Membre.php';
require_once __DIR__ . '/../helpers/Validation.php';
require_once __DIR__ . '/../helpers/DateHelper.php';

class AuthController
{
    public static function register(array $body): void
    {
        $validation = (new Validation())
            ->required($body, ['nom', 'prenom', 'email', 'mot_de_passe', 'confirmPassword', 'numero_tel'])
            ->email($body, 'email')
            ->minLength($body, 'mot_de_passe', 6)
            ->same($body, 'mot_de_passe', 'confirmPassword')
            ->phone($body, 'numero_tel')
            ->date($body, 'date_naissance')
            ->beforeToday($body, 'date_naissance');

        if ($validation->fails()) {
            Response::validationError($validation->getErrors());
            return;
        }

        $membreModel = new Membre();

        if ($membreModel->emailExists($body['email'])) {
            Response::error('Cet email est déjà utilisé', 409);
            return;
        }

        $nouveauMembre = $membreModel->create([
            'nom'            => $body['nom'],
            'prenom'         => $body['prenom'],
            'email'          => $body['email'],
            'mot_de_passe'   => password_hash($body['mot_de_passe'], PASSWORD_BCRYPT),
            'numero_tel'     => $body['numero_tel'],
            'date_naissance' => DateHelper::toSqlDate($body['date_naissance'] ?? null),
        ]);

        Response::success($nouveauMembre, 'Compte créé avec succès', 201);
    }
}