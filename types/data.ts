interface Data {
    value: {
      error: string | null;
      data: {
        user: {
          username: string;
          role: string;
          name: string;
        };
        token: string;
      };
    };
  }