import { MeditationTimer } from "./MeditationTimer";

export function MeditationPage() {
  return (
    <div className="container container--narrow">
      <div className="medi-page">
        <MeditationTimer place="page" variant="page" />
      </div>
      <aside className="tips">
        <h2>Gợi ý cho người mới</h2>
        <ul>
          <li>Ngồi thoải mái, lưng thẳng nhưng không gồng. Có thể ngồi ghế.</li>
          <li>Thở tự nhiên. Chỉ cần biết mình đang thở vào, đang thở ra.</li>
          <li>Khi tâm chạy theo suy nghĩ, nhẹ nhàng đưa sự chú ý về hơi thở — không trách mình.</li>
        </ul>
      </aside>
    </div>
  );
}
