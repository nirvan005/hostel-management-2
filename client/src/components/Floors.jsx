import Rooms from "./Rooms";

const Floors = ({ floors }) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 w-80 floor">
      {floors.map((floor, index) => (
        <div
          key={index}
          className="border rounded-lg shadow-lg p-4 mb-5 w-80 floor-each"
        >
          <h2 className="text-xl font-bold mb-4 floor-head">
            Floor {floor.number}
          </h2>
          <Rooms rooms={floor.rooms} />
        </div>
      ))}
    </div>
  );
};

export default Floors;
