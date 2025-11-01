// FAQ Service for API calls
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://sakura-backend.onrender.com");

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  tags: string[];
}

export interface UpdateFAQRequest extends CreateFAQRequest {}

export interface GetFAQsParams {
  skip?: number;
  limit?: number;
  search?: string;
}

class FAQService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/knowledge-base`;
  }

  async getFAQs(params: GetFAQsParams = {}): Promise<FAQ[]> {
    const { skip = 0, limit = 1000, search } = params;
    const searchParams = new URLSearchParams();
    searchParams.append("skip", skip.toString());
    searchParams.append("limit", limit.toString());
    if (search) {
      searchParams.append("search", search);
    }

    const response = await fetch(`${this.baseUrl}/faqs?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch FAQs: ${response.statusText}`);
    }

    return response.json();
  }

  async getFAQ(id: string): Promise<FAQ> {
    const response = await fetch(`${this.baseUrl}/faqs/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("FAQ not found");
      }
      throw new Error(`Failed to fetch FAQ: ${response.statusText}`);
    }

    return response.json();
  }

  async createFAQ(data: CreateFAQRequest): Promise<FAQ> {
    const response = await fetch(`${this.baseUrl}/faqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create FAQ: ${response.statusText}`);
    }

    return response.json();
  }

  async updateFAQ(id: string, data: UpdateFAQRequest): Promise<FAQ> {
    const response = await fetch(`${this.baseUrl}/faqs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("FAQ not found");
      }
      throw new Error(`Failed to update FAQ: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFAQ(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/faqs/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("FAQ not found");
      }
      throw new Error(`Failed to delete FAQ: ${response.statusText}`);
    }
  }

  async deleteMultipleFAQs(ids: string[]): Promise<void> {
    const searchParams = new URLSearchParams();
    ids.forEach((id) => searchParams.append("ids", id));

    const response = await fetch(`${this.baseUrl}/faqs?${searchParams.toString()}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete FAQs: ${response.statusText}`);
    }
  }
}

export const faqService = new FAQService();

