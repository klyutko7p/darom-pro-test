interface QRBody {
  Data: {
    amount: number;
    currency: string;
    paymentPurpose: string;
    qrcType: string;
    imageParams: {
      width: number;
      height: number;
      mediaType: string;
    };
    sourceName: string;
    ttl: number;
    redirectUrl: string;
  };
}

interface QRBodyInfo {
  Data: {
    payload: string;
    operationId: string;
    imageParams: {
      width: number;
      height: number;
      mediaType: string;
      content: string;
    };
  };
}

interface QRBodyLink {
  Data: {
    Operation: [
      {
        customerCode: string;
        taxSystemCode: string;
        paymentType: string;
        paymentId: string;
        transactionId: string;
        createdAt: string;
        paymentMode: string;
        redirectUrl: number;
        failRedirectUrl: number;
        purpose: string;
        amount: number;
        status: string;
        operationId: string;
        paymentLink: string;
      }
    ];
  };
}

interface QRPaymentStatus {
  Data: {
    Operation: [
      {
        status: string;
      }
    ];
  };
}
