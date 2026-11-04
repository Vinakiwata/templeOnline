import { useState } from "react";
import { recordActivity } from "../../journal/application/activityService";
import { useTempleStore } from "../application/templeStore";
import { endTempleMeditation } from "../application/actionHandler";
import { playSmallBell } from "../../../shared/audio/sound";

/**
 * Năm điều quán tưởng trước bữa ăn (Ngũ quán) — diễn ý bằng lời giản dị.
 * Nội dung do Chùa Online biên soạn, cần quý Thầy/Cô rà soát trước khi phát hành.
 */
const CONTEMPLATIONS = [
  "Thức ăn này là công sức của bao người và của đất trời. Con xin dùng bữa trong lòng biết ơn.",
  "Con xin tự xét công hạnh của mình, để xứng đáng nhận bữa ăn này.",
  "Con xin giữ tâm không tham, không chê bai — ăn vừa đủ, không phung phí.",
  "Con dùng thức ăn như thuốc lành để nuôi thân, giữ sức khỏe mà tu học.",
  "Con dùng bữa ăn này để nuôi dưỡng con đường hiểu biết và thương yêu.",
];

/** Thọ trai tại Trai đường: ngồi xuống, quán tưởng từng điều, rồi dùng bữa trong chánh niệm. */
export function MealPanel() {
  const [step, setStep] = useState(-1); // -1: mời ngồi; 0..4: quán tưởng; 5: dùng bữa
  const showToast = useTempleStore((s) => s.showToast);
  const name = useTempleStore((s) => s.playerName);
  const seatId = useTempleStore((s) => s.panelTargetId);

  const next = () => {
    playSmallBell();
    setStep((s) => s + 1);
  };

  const finish = () => {
    recordActivity({ activityType: "have_meal", objectId: "trai-duong", metadata: { seat: seatId } });
    showToast("Cơm chay thanh tịnh", "Thân an, tâm lạc — nguyện cho mọi người đều no đủ.");
    endTempleMeditation();
  };

  return (
    <div className="sheet sheet--meal" role="dialog" aria-label="Thọ trai">
      <p className="eyebrow">Trai đường</p>
      {step < 0 && (
        <>
          <h2>Mời {name} an toạ</h2>
          <p className="sheet__body">
            Bữa trưa hôm nay: cơm trắng, canh rau ngót, đậu hũ kho nấm và chuối tráng miệng. Trước khi dùng bữa, đại chúng
            cùng lặng lẽ quán tưởng năm điều. Chạm “Tiếp” sau mỗi điều, thở một hơi chậm.
          </p>
          <div className="sheet__footer">
            <button type="button" className="btn btn--ghost" onClick={endTempleMeditation}>
              Để sau
            </button>
            <button type="button" className="btn btn--primary" onClick={next}>
              Bắt đầu quán tưởng
            </button>
          </div>
        </>
      )}
      {step >= 0 && step < CONTEMPLATIONS.length && (
        <>
          <h2>
            Điều {step + 1} / {CONTEMPLATIONS.length}
          </h2>
          <p className="meal-verse">{CONTEMPLATIONS[step]}</p>
          <div className="meal-dots" aria-hidden="true">
            {CONTEMPLATIONS.map((_, i) => (
              <span key={i} className={i <= step ? "is-on" : ""} />
            ))}
          </div>
          <div className="sheet__footer">
            <button type="button" className="btn btn--primary" onClick={next}>
              Tiếp
            </button>
          </div>
        </>
      )}
      {step >= CONTEMPLATIONS.length && (
        <>
          <h2>Dùng bữa trong chánh niệm</h2>
          <p className="sheet__body">
            Ăn chậm, nhai kỹ, cảm nhận vị của từng món. Không vội, không nghĩ ngợi chuyện khác — chỉ có bạn và bữa cơm này.
            Khi xong, đặt đũa nhẹ nhàng và chắp tay cảm ơn.
          </p>
          <div className="sheet__footer">
            <button type="button" className="btn btn--primary" onClick={finish}>
              Thọ trai xong
            </button>
          </div>
        </>
      )}
      <p className="dharma-note">Năm điều quán tưởng được diễn ý bằng lời giản dị.</p>
    </div>
  );
}
