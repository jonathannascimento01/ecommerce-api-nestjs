-- CreateTable
CREATE TABLE "tbl_addresses" (
    "address_id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "zip_code" VARCHAR(9) NOT NULL,
    "street" VARCHAR(120) NOT NULL,
    "number" VARCHAR(20),
    "complement" VARCHAR(80),
    "district" VARCHAR(80),
    "city" VARCHAR(80),
    "state" CHAR(2),
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tbl_addresses_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "tbl_brands" (
    "brand_id" BIGSERIAL NOT NULL,
    "brand_name" VARCHAR(80) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_brands_pkey" PRIMARY KEY ("brand_id")
);

-- CreateTable
CREATE TABLE "tbl_cart_items" (
    "cart_item_id" BIGSERIAL NOT NULL,
    "cart_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "tbl_cart_items_pkey" PRIMARY KEY ("cart_item_id")
);

-- CreateTable
CREATE TABLE "tbl_carts" (
    "cart_id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_carts_pkey" PRIMARY KEY ("cart_id")
);

-- CreateTable
CREATE TABLE "tbl_categories" (
    "category_id" BIGSERIAL NOT NULL,
    "category_name" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "tbl_coupons" (
    "coupon_id" BIGSERIAL NOT NULL,
    "coupon_code" VARCHAR(30) NOT NULL,
    "description" VARCHAR(150),
    "discount_type" VARCHAR(20) NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "minimum_value" DECIMAL(10,2),
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "max_uses" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tbl_coupons_pkey" PRIMARY KEY ("coupon_id")
);

-- CreateTable
CREATE TABLE "tbl_customers" (
    "customer_id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "tbl_order_items" (
    "order_item_id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "tbl_order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "tbl_orders" (
    "order_id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "coupon_id" BIGINT,
    "order_number" VARCHAR(30) NOT NULL,
    "subtotal_amount" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "tbl_payments" (
    "payment_id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "payment_method" VARCHAR(20) NOT NULL,
    "transaction_code" VARCHAR(120),
    "amount" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "paid_at" TIMESTAMP(6),

    CONSTRAINT "tbl_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "tbl_product_images" (
    "image_id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "sort_order" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "tbl_product_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "tbl_products" (
    "product_id" BIGSERIAL NOT NULL,
    "brand_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "sku" VARCHAR(30) NOT NULL,
    "product_name" VARCHAR(150) NOT NULL,
    "short_description" VARCHAR(255),
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "promotional_price" DECIMAL(12,2),
    "volume_ml" SMALLINT,
    "weight_grams" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "tbl_stock" (
    "product_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_stock_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "tbl_stock_movements" (
    "movement_id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "movement_type" VARCHAR(20) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_stock_movements_pkey" PRIMARY KEY ("movement_id")
);

-- CreateTable
CREATE TABLE "tbl_wishlist" (
    "wishlist_id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_wishlist_pkey" PRIMARY KEY ("wishlist_id")
);

-- CreateTable
CREATE TABLE "tbl_users" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "idx_tbl_addresses_customer" ON "tbl_addresses"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_brands_name" ON "tbl_brands"("brand_name");

-- CreateIndex
CREATE INDEX "idx_tbl_brands_active" ON "tbl_brands"("active");

-- CreateIndex
CREATE INDEX "idx_tbl_cart_items_cart" ON "tbl_cart_items"("cart_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_cart_item" ON "tbl_cart_items"("cart_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_carts_customer" ON "tbl_carts"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_categories_name" ON "tbl_categories"("category_name");

-- CreateIndex
CREATE INDEX "idx_tbl_categories_active" ON "tbl_categories"("active");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_coupons_code" ON "tbl_coupons"("coupon_code");

-- CreateIndex
CREATE INDEX "idx_tbl_coupons_code" ON "tbl_coupons"("coupon_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_customers_email" ON "tbl_customers"("email");

-- CreateIndex
CREATE INDEX "idx_tbl_customers_email" ON "tbl_customers"("email");

-- CreateIndex
CREATE INDEX "idx_tbl_order_items_order" ON "tbl_order_items"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_orders_number" ON "tbl_orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_payments_order" ON "tbl_payments"("order_id");

-- CreateIndex
CREATE INDEX "idx_tbl_product_images_product" ON "tbl_product_images"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_products_sku" ON "tbl_products"("sku");

-- CreateIndex
CREATE INDEX "idx_tbl_products_active" ON "tbl_products"("active");

-- CreateIndex
CREATE INDEX "idx_tbl_products_brand" ON "tbl_products"("brand_id");

-- CreateIndex
CREATE INDEX "idx_tbl_products_category" ON "tbl_products"("category_id");

-- CreateIndex
CREATE INDEX "idx_tbl_products_name" ON "tbl_products"("product_name");

-- CreateIndex
CREATE INDEX "idx_tbl_stock_movements_product" ON "tbl_stock_movements"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tbl_wishlist" ON "tbl_wishlist"("customer_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_email_key" ON "tbl_users"("email");

-- AddForeignKey
ALTER TABLE "tbl_addresses" ADD CONSTRAINT "fk_tbl_addresses_customer" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_cart_items" ADD CONSTRAINT "fk_tbl_cart_items_cart" FOREIGN KEY ("cart_id") REFERENCES "tbl_carts"("cart_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_cart_items" ADD CONSTRAINT "fk_tbl_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_carts" ADD CONSTRAINT "fk_tbl_carts_customer" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_order_items" ADD CONSTRAINT "fk_tbl_order_items_order" FOREIGN KEY ("order_id") REFERENCES "tbl_orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_order_items" ADD CONSTRAINT "fk_tbl_order_items_product" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_orders" ADD CONSTRAINT "fk_tbl_orders_coupon" FOREIGN KEY ("coupon_id") REFERENCES "tbl_coupons"("coupon_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_orders" ADD CONSTRAINT "fk_tbl_orders_customer" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_payments" ADD CONSTRAINT "fk_tbl_payments_order" FOREIGN KEY ("order_id") REFERENCES "tbl_orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_product_images" ADD CONSTRAINT "fk_tbl_product_images_product" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_products" ADD CONSTRAINT "fk_tbl_products_brand" FOREIGN KEY ("brand_id") REFERENCES "tbl_brands"("brand_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_products" ADD CONSTRAINT "fk_tbl_products_category" FOREIGN KEY ("category_id") REFERENCES "tbl_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_stock" ADD CONSTRAINT "fk_tbl_stock_product" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_stock_movements" ADD CONSTRAINT "fk_tbl_stock_movements_product" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_wishlist" ADD CONSTRAINT "fk_tbl_wishlist_customer" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_wishlist" ADD CONSTRAINT "fk_tbl_wishlist_product" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
