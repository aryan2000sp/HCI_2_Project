import '../Sass/MainPage.scss'
import '../Sass/card.scss'
import BasicChart from './BasicChart.jsx'


function MainPage() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <section className='main-page'>
        <div className='pie-chart card-color'>
          <BasicChart/>
        </div>
        <div className='dues card-color'>
          <h1>Dues</h1>
          <p>Something para</p>
        </div>
        <div className='goals card-color'><h1>Goals</h1></div>
      </section>

    </>
  )
}



export default MainPage

 
