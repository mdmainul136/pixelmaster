<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

trait ApiResponse
{
    /**
     * Success Response
     * 
     * @param mixed $data
     * @param string|null $message
     * @param int $code
     * @param array $metadata
     * @return JsonResponse
     */
    protected function successResponse($data = null, ?string $message = null, int $code = Response::HTTP_OK, array $metadata = []): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'metadata' => array_merge([
                'timestamp' => now()->toISOString(),
            ], $metadata)
        ], $code);
    }

    /**
     * Error Response
     * 
     * @param string $message
     * @param int $code
     * @param mixed|null $errors
     * @return JsonResponse
     */
    protected function errorResponse(string $message, int $code = Response::HTTP_BAD_REQUEST, $errors = null): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
            'metadata' => [
                'timestamp' => now()->toISOString(),
            ]
        ], $code);
    }

    /**
     * Unauthorized Response
     * 
     * @param string $message
     * @return JsonResponse
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Forbidden Response
     * 
     * @param string $message
     * @return JsonResponse
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_FORBIDDEN);
    }

    /**
     * Not Found Response
     * 
     * @param string $message
     * @return JsonResponse
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_NOT_FOUND);
    }
}
