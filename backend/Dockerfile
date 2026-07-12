FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    libpq \
    autoconf \
    gcc \
    g++ \
    make

RUN docker-php-ext-install pdo pdo_pgsql

RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

RUN apk del autoconf gcc g++ make

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000

CMD ["php-fpm"]