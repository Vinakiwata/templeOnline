/**
 * Bài pháp ngắn cho Giảng đường.
 * Nội dung do Chùa Online biên soạn bằng lời giản dị — cần quý Thầy/Cô cố vấn rà soát trước khi phát hành.
 */
export interface DharmaTalk {
  id: string;
  title: string;
  minutes: number;
  paragraphs: string[];
}

export const DHARMA_TALKS: DharmaTalk[] = [
  {
    id: "song-trong-hien-tai",
    title: "Sống trong hiện tại",
    minutes: 2,
    paragraphs: [
      "Kính chào quý Phật tử và các bạn. Hôm nay chúng ta cùng nói về một điều rất gần: hơi thở.",
      "Mỗi ngày ta thở hàng nghìn lần nhưng hiếm khi biết mình đang thở. Tâm ta thường ở chuyện hôm qua hoặc lo cho ngày mai, ít khi có mặt ở đây.",
      "Chánh niệm là biết rõ điều đang xảy ra. Thở vào, biết mình đang thở vào. Thở ra, biết mình đang thở ra. Chỉ vậy thôi, không cần cố gắng thay đổi gì.",
      "Khi rửa chén, ta chỉ rửa chén. Khi đi, ta biết mình đang bước. Những việc nhỏ được làm trong chánh niệm sẽ trở thành giờ phút tu tập.",
      "Mời các bạn dừng lại, thở ba hơi thật nhẹ. Đó là món quà ta tặng cho chính mình.",
    ],
  },
  {
    id: "long-tu-bi",
    title: "Nuôi dưỡng lòng từ",
    minutes: 2,
    paragraphs: [
      "Từ là mong muốn đem niềm vui đến cho người khác. Bi là mong muốn làm vơi bớt khổ đau. Hai hạt giống ấy có sẵn trong mỗi chúng ta.",
      "Ta có thể bắt đầu với chính mình: nguyện cho tôi được bình an, nguyện cho tôi biết thương yêu và chăm sóc thân tâm này.",
      "Rồi mở rộng ra người thân: nguyện cho cha mẹ, anh chị em, bạn bè được khỏe mạnh và an vui.",
      "Khó hơn là gửi lòng từ đến người làm ta buồn. Không cần ép mình; chỉ cần hiểu rằng họ cũng đang mang những khổ đau riêng.",
      "Lòng từ lớn dần qua từng ngày thực tập, như cây được tưới nước đều đặn.",
    ],
  },
  {
    id: "vo-thuong",
    title: "Vô thường và trân quý",
    minutes: 2,
    paragraphs: [
      "Mọi sự vật đều thay đổi: hoa nở rồi tàn, mùa nắng rồi mùa mưa, niềm vui hay nỗi buồn cũng đến rồi đi. Đức Phật gọi đó là vô thường.",
      "Hiểu vô thường không làm ta bi quan. Ngược lại, vì mọi thứ không còn mãi, ta biết trân quý những gì đang có trong hiện tại.",
      "Khi gặp khó khăn, nhớ rằng điều này rồi cũng sẽ qua. Khi hạnh phúc, ta tận hưởng trọn vẹn mà không bám chặt.",
      "Hôm nay, hãy nói một lời tử tế với người bên cạnh. Đó là cách đẹp nhất để sống với sự vô thường.",
    ],
  },
];
