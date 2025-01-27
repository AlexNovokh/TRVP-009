import { useState } from "react";
import { deleteTeam, moveTeam } from "../../requests";

export default function InnerCard({ data, allData, parentData }) {
    const { team_id, team_name, members, specialization_id } = data;
    const { mentor_id } = parentData;

    const [shown, setShown] = useState(false);
    const [newData, setNewData] = useState({
        new_mentor_id: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'new_mentor_id') {
            const curr = allData.find((element) => element.mentor_id === parseInt(value));
            if (curr?.teams?.length >= curr?.max_teams) {
                alert("У этого наставника нет мест для новых команд.");
                return;
            }
        }

        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await moveTeam(team_id, newData);
        if (res === 200) {
            setShown(false);
            window.location.reload();
        }
    };

    const handleChancel = (e) => {
        e.preventDefault();
        setShown(false);
    };

    const handleDelete = async () => {
        if (window.confirm(`Вы уверены, что хотите удалить команду "${team_name}"?`)) {
            const res = await deleteTeam(team_id);
            if (res) {
                alert(res.message);
                window.location.reload();
            }
        }
    };

    return (
        <div className="inner-card-block">
            <div className="inner-card-block-title">
                <span className="inner-card-block-name">
                    «{team_name}» - Участники: {members.join(', ')}
                </span>
                {shown ? (
                    <>
                        <form onSubmit={handleSubmit} className="form-block inner">
                            <div className="form-input-block">
                                <label htmlFor="new_mentor_id">Новый наставник:</label>
                                <select
                                    name="new_mentor_id"
                                    value={newData.new_mentor_id}
                                    onChange={(e) => handleChange(e)}
                                    required
                                >
                                    <option value="" disabled>
                                        --Выберите наставника--
                                    </option>
                                    {allData
                                        .filter((element) => element.specialization_id === specialization_id && element.mentor_id !== mentor_id)
                                        .map((element) => (
                                            <option key={element.mentor_id} value={element.mentor_id}>
                                                {element.mentor_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="buttons-block">
                                <button className="grey-button" type="button" onClick={(e) => handleChancel(e)}>Отменить</button>
                                <button className="filed-button" type="submit">Сохранить</button>
                            </div>
                        </form>
                    </>
                ) : ("")}
            </div>

            <div className="inner-card-block-buttons">
                {!shown && (<img src="/images/icon-change.png" alt="Перенаправить" onClick={() => setShown(true)} />)}
                <img className="inner-card-block-buttons-delete" src="/images/icon-delete.png" alt="Удалить" onClick={handleDelete} />
            </div>
        </div>
    );
}