export interface Monitor {
  version: number;
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  tags?: string[];
  website: {
    url: string;
    parser: string;
    selectors?: {
      item: string;
      title: string;
      link: string;
      date?: string;
    };
  };
  notifications: {
    telegram: boolean;
  };
  matching: {
    mustMatch: string[];
    shouldMatch: Array<{ keyword: string; score: number }>;
    mustNotMatch: string[];
    minimumScore: number;
  };
}
