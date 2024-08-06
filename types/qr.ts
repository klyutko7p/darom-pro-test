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
    qrcId: string;
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
    payload: string;
    accountId: string;
    status: string;
    createdAt: string;
    merchantId: string;
    legalId: string;
    qrcId: string;
    amount: number;
    commissionPercent: number;
    currency: string;
    paymentPurpose: string;
    qrcType: string;
    templateVersion: string;
    sourceName: string;
    ttl: string;
    image: {
      width: number;
      height: number;
      mediaType: string;
      content: string;
    };
  },
}

interface QRPaymentStatus {
  Data: {
    paymentList: [
      {
        qrcId: string,
        code: string,
        status: string,
        message: string,
        trxId: string,
      }
    ],
  }
}