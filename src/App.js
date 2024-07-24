import "./App.css";
import Footer from "./elements/footer";
import Main from "./elements/main";

function App() {
  return (
    <div className="bg-[url('/src/assets/bg.png')] bg-cover bg-center bg-[#161820] text-white px-[3vw] text-center min-h-screen">
      <section className="max-w-[650px] mx-auto">
        <Main />
        <Footer />
      </section>
    </div>
  );
}

// py-[7vh] md:px-[30vw] md:py-[15vh]
export default App;
