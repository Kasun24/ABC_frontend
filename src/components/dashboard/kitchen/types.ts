export type OrderListingType = {
    id: number;
    gm_id?: number;
    branch_id: number;
    user_id?: number;
    table_orders_id?: number;
    payment_type: string;
    payment_id: string;
    payment_data?: string;
    status: string;
    order_delivery_type: string;
    order_from: string;
    delivery_address?: string;
    delivery_longitude?: string;
    delivery_latitude?: string;
    delivery_status?: string;
    delivery_time?: string;
    delivery_time_resturent?: string;
    name: string;
    email: string;
    mobile_number?: string;
    backyard?: string;
    special_note?: string;
    remarks?: string;
    total_tax_inclusive: number;
    total_tax_exclusive: number;
    net_total_without_tax: number;
    net_total: number;
    total_discount: number;
    total_with_discount_price: number;
    delivery_tax_inclusive: number;
    delivery_tax_exclusive: number;
    delivery_cost: number;
    gross_total: number;
    language?: string;
    device_id?: string;
    review?: string;
    order_review_stars?: number;
    order_review_delivery_type_stars?: number;
    order_action_date?: string;
    order_completed_date?: string;
    is_winorder: string;
    points?: number;
    payment_points?: number;
    sides_remote_order_id?: string;
    sides_order_status?: string;
    sides_sync: string;
    transaction_fee: number;
    transaction_fee_tax: number;
    transaction_fee_tax_details?: string;
    transaction_fee_type?: string;
    coupon_details?: string;
    coupon_discount?: number;
    fixed_transaction_fee: number;
    total_topping_inclusive_tax_amount: number;
    total_topping_exclusive_tax_amount: number;
  };
  
  export type ExtraType = {
    id: number;
    name: string;
    addonOptional: string;
  };
  export type ExtraHeadersType = {
    title: string;
    align?: string;
    sortable?: boolean;
    key: string;
  };
  