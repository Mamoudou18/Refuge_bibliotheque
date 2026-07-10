<?php

class Response {
    public static function json(array $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message, int $status = 400): void {
        self::json(['status' => 'error', 'message' => $message], $status);
    }

    public static function success($data = null, string $message = 'OK', int $status = 200): void {
        $payload = ['status' => 'success', 'message' => $message];
        if ($data !== null) {
            $payload['data'] = $data;
        }
        self::json($payload, $status);
    }

    public static function validationError(array $errors, string $message = 'Validation failed'): void {
        self::json(['status' => 'error', 'message' => $message, 'details' => $errors], 422);
    }
}