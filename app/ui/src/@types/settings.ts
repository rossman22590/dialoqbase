// Billed USD per 1M tokens (markup included); null when the model has no
// known price.
export type ModelPrices = {
  input_price_per_1m?: number | null;
  output_price_per_1m?: number | null;
  request_price?: number | null;
  price_tiers?: {
    min_prompt_tokens: number;
    input_price_per_1m: number;
    output_price_per_1m: number;
  }[];
};

export type GetAllModelResponse = {
  data: ({
    id: number;
    name: string | null;
    model_id: string;
    model_type: string;
    stream_available: boolean;
    model_provider: string | null;
    local_model: boolean;
    config: any;
    hide: boolean;
    deleted: boolean;
    createdAt: string;
  } & ModelPrices)[];
  embedding: ({
    id: number;
    name: string | null;
    model_id: string;
    model_type: string;
    stream_available: boolean;
    model_provider: string | null;
    local_model: boolean;
    config: any;
    hide: boolean;
    deleted: boolean;
    createdAt: string;
  } & ModelPrices)[];
  price_markup?: number;
};
