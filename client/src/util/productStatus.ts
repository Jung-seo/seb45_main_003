export const translateProductStatus = (productStatus: string): string => {
  if (productStatus === "BEFORE") {
    return "구매 가능";
  } else if (productStatus === "TRADE") {
    return "구매자와 거래 진행중";
  } else if (productStatus === "AFTER") {
    return "거래 성사";
  } else if (productStatus === "CANCLE") {
    return "거래 파기";
  }
  return ""; //알맞은 값이 안 들어왔을 때
};
