import 'regenerator-runtime/runtime'
import 'bootstrap/dist/css/bootstrap.min.css';
import './global.css'
import './cointopright.css'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap';
import { logout, convertYocto, flip, gettxsRes, menusayings, fees, sendpostwithplay, startup } from './utils'
import { NotLogged, Loading, RecentPlays, TopPlays, TopPlayers } from './components/logged';
import Confetti from 'react-confetti';
import ParasLogoB from './assets/paras-black.svg';
import ParasLogoW from './assets/paras-white.svg';
import LOGOMAIN from './assets/result.svg';
import LOGODOG from './assets/nearcoindoggo.svg';
import LOGOBACK from './assets/nearcoin.svg';
import { useSearchParams, useNavigate } from "react-router-dom";
import Popup from 'reactjs-popup';
import { Twitter, Discord, Sun, Moon } from 'react-bootstrap-icons';
import useWindowSize from 'react-use/lib/useWindowSize'
import getConfig from './config'
import { Link } from 'react-router-dom';

//for flips animation
import $ from 'jquery';
import { render } from 'react-dom';
import { TimelineMax, TweenLite, TweenMax, Power1, Bounce } from "gsap";


const { networkId } = getConfig(process.env.NODE_ENV || 'testnet')
const doggochance = 0.05;


//import { ThemeProvider } from 'styled-components';
function genrandomphrase() {
  return menusayings[Math.floor(Math.random() * menusayings.length)];
}


export default function App() {
  startup();

  img1 = new Image();
  img2 = new Image();
  img3 = new Image();

  img1.src = LOGOMAIN;
  img2.src = LOGOBACK;
  img3.src = LOGODOG;
  const { width, height } = useWindowSize();

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();

  const [buttonDisabled, setButtonDisabled] = React.useState(false)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)


  // on the top right
  const [balance, setbalance] = React.useState("")


  // Dark Theme
  const [darkMode, setDarkMode] = React.useState("light")

  const [tailsHeads, setTailsHeads] = React.useState(Math.random() < 0.5 ? "tails" : "heads")

  // surprise phrase
  const [surprisePhrase, setSurprisePhrase] = React.useState(genrandomphrase())

  const [ammoutNEAR, setammout] = React.useState("")

  const [ammountWon, setWonAmmount] = React.useState("")


  const [txsHashes, settxsHash] = React.useState(searchParams.get("transactionHashes"));

  let msg = "";
  if (searchParams.get("errorCode")) {
    msg = searchParams.get("errorCode") + ", " + (searchParams.get("errorMessage").replaceAll("%20", " ")) + ".";

  }

  const [errormsg, setErrormsg] = React.useState(msg);

  const [txsResult, settxsResult] = React.useState("");

  //popup
  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //
  const [showDoggo, setShowDogo] = React.useState(false);


  const toogleDarkMode = () => {
    let newmode = darkMode === "light" ? "dark" : "light"
    setDarkMode(newmode)
  }

  const setPrice = (price) => {
    setammout(price)
  }

  const [showwhosplayin, setshowwhosplayin] = React.useState(false);

  const resetGame = () => {
    setTailsHeads(Math.random() < 0.5 ? "tails" : "heads")
    settxsHash("")
    settxsResult("")
    setErrormsg("")
    setWonAmmount("")
    setprocessing(false)


    searchParams.delete("transactionHashes")
    searchParams.delete("errorCode")
    searchParams.delete("errorMessage")
    navigate(searchParams.toString());
  }

  const [processing, setprocessing] = React.useState(false);


  const getTxsResult = async () => {
    let decodedstr = "";
    let decodedWonAmmountstr = "";

    await gettxsRes(txsHashes).then(res => {
      //console.log(res)
      setShowNotification(true)

      let decoded = Buffer.from(res.status.SuccessValue, 'base64')
      decodedstr = decoded.toString("ascii");

      let decodedWonAmmount = res.transaction.actions[0].FunctionCall.deposit / fees;

      sendpostwithplay(txsHashes);

      try {
        decodedWonAmmountstr = convertYocto(decodedWonAmmount.toLocaleString('fullwide', { useGrouping: false }));

      } catch (e) {
        console.log("Error converting ammount bet to string.");
      }

      //console.log("decoded result: "+ decodedstr)

    }).catch(e => {
      if (!e instanceof TypeError) {
        console.error(e);
      }

    })

    settxsResult(decodedstr);
    setWonAmmount(decodedWonAmmountstr)
  }

  React.useEffect(
    () => {
      checkifdoggo();

      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {
        console.log("LOADING BALANCE AND HEADS OR TAILS")
        window.walletConnection.account().getAccountBalance().then(function (balance) {
          let fullstr = convertYocto(balance.available).split(".");
          let str = fullstr[0] + "." + fullstr[1].substring(0, 4);
          setbalance("NEAR: " + str);
        }).catch(e => {
          console.log('There has been a problem with getting your balance: ' + e.message);
          setbalance("Couldn't Fetch Balance");
        });


        searchParams.delete("errorCode");
        searchParams.delete("errorMessage");
        navigate(searchParams.toString());


        getTxsResult(txsHashes);
      }

    },

    //! The second argument to useEffect tells React when to re-run the effect
    //! Use an empty array to specify "only run on first render"
    //! This works because signing into NEAR Wallet reloads the page
    []
  )

  const checkifdoggo = () => {
    let random = Math.random()
    if (random < doggochance) {
      setShowDogo(true);
    }
  }

  const toggleHeadsTails = () => {
    if (tailsHeads === "heads") {
      setTailsHeads("tails")
    } else {
      setTailsHeads("heads")
    }
  }


  const contentStyle = {
    maxWidth: "660px",
    width: "90%"
  };


  return (
    <div className={darkMode}>
      {showNotification && <Notification />}
      {errormsg && <NotificationError err={errormsg} />}
      <div className='social-icons'>
        <div className='d-flex flex-sm-column justify-content-start align-items-center h-100 mt-auto'>
          <div className='mt-3 d-flex flex-column shortcut-row'>
            <div className='d-flex flex-sm-row ustify-content-center flex-column mb-2 toolbar mx-auto'>

              <div className='d-flex flex-row'>
                <div role='button' className='retro-btn warning'>
                  <Link id="RouterNavLink" to='/play'><div className='buttoncool'>
                    <span className='btn-inner'>
                      <span className='content-wrapper'>
                        <span className='btn-content'>
                          <span className='btn-content-inner' label="More Games">
                          </span>
                        </span>
                      </span>
                    </span>
                  </div></Link>


                </div>
                <Popup trigger={
                  <div role='button' className='retro-btn danger'>
                    <a className='buttoncool'>
                      <span className='btn-inner'>
                        <span className='content-wrapper'>
                          <span className='btn-content'>
                            <span className='btn-content-inner' label="ON FIRE">
                            </span>
                          </span>
                        </span>
                      </span>
                    </a>
                  </div>

                } position="center center"
                  modal
                  contentStyle={contentStyle}
                >
                  <TopPlays />
                </Popup>

              </div>

              <div className='d-flex flex-row'>
                <Popup trigger={
                  <div role='button' className='retro-btn'>
                    <a className='buttoncool'>
                      <span className='btn-inner'>
                        <span className='content-wrapper'>
                          <span className='btn-content'  >
                            <span className='btn-content-inner' label="WHO'S PLAYIN">
                            </span>
                          </span>
                        </span>
                      </span>
                    </a>
                  </div>
                } position="center center"
                  modal
                  contentStyle={contentStyle}
                >
                  <RecentPlays />

                </Popup>

                <Popup trigger={
                  <div role='button' className='retro-btn info'>
                    <a className='buttoncool'>
                      <span className='btn-inner'>
                        <span className='content-wrapper'>
                          <span className='btn-content'>
                            <span className='btn-content-inner' label="TOP PLAYERS">
                            </span>
                          </span>
                        </span>
                      </span>
                    </a>
                  </div>
                } position="center center"
                  modal
                  contentStyle={contentStyle}
                >
                  <TopPlayers />
                </Popup>
              </div>
              {!window.walletConnection.isSignedIn() ? <></> : <><div className="profile-picture-md"><img className="image rounded-circle cursor-pointer border-2" src="https://i.imgur.com/E3aJ7TP.jpg" alt="" onClick={handleShow} />
              </div>
                <Modal show={show} onHide={handleClose} aria-labelledby="contained-modal-title-vcenter" centered>
                  <Modal.Body className='p-0' style={{ color: "black" }}>
                    <div className='d-flex flex-column '>
                      <div className="card-body text-center">
                        <h4 style={{ fontWeight: "bold" }}>USER PROFILE</h4>
                        <h6>
                          <small style={{ fontWeight: "semibold" }} className="w-30">Currently logged as:{window.accountId}!</small>
                        </h6>
                        <div className="profile-picture d-flex w-80 mb-3">
                          <div className="imageWrapper ms-auto me-auto">
                            <img className="rounded-circle cursor-pointer image-large" src="https://i.imgur.com/E3aJ7TP.jpg" alt="pfp" />
                            <a href="#" className="cornerLink" ><small style={{ fontSize: "0.75rem" }}>CHANGE PICTURE</small></a>
                          </div>
                        </div>
                        <h6>First Fliperino: </h6>
                        <div className="input-group">

                          {/*<input type="text" className="form-control" placeholder="Nickname" aria-label="Username" aria-describedby="basic-addon1" value=""/>
                        */}
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <div className='d-flex  flex-column justify-content-center bg-light linetop' style={{ margin: "0px" }}>
                    <button className='w-80 mt-3 ms-3 me-3 justify-content-center mx-auto btnhover btn btn-success' style={{ fontFamily: "VCR_OSD_MONO", fontWeight: "normal", fontSize: "1.1rem" }} onClick={handleClose}>Save</button>
                    <button className='btn w-80 mt-2 ms-3 me-3 rounded-2 btn-danger mb-3 ' onClick={logout} style={{ fontWeight: "semibold", fontSize: "1.1rem" }}>Disconnect Wallet</button>
                  </div>
                </Modal>
              </>
              }
            </div>
            {window.walletConnection.isSignedIn() && <h6 className="mt-1 balance-text mb-0">{balance === "" ? <Loading /> : balance}</h6>
            }

          </div>
        </div>
      </div>
      <div className='text-center body-wrapper h-100'>
        <div className="toast-container position-absolute top-0 start-0 p-3 top-index"></div>
        <div className="toast-container position-absolute top-0 start-0 p-3 top-index"></div>
        <div className="toast-container position-absolute top-0 start-0 p-3 top-index"></div>
        <div className="toast-container position-absolute top-0 start-0 p-3 top-index"></div>
        <div className="toast-container position-absolute top-0 start-0 p-3 top-index"></div>

        <div className='play form-signin'>
          {txsHashes ?
            <div className='maincenter text-center'>
              <FlipCoin result={tailsHeads} loading={false} won={txsResult} width={width} height={height} reset={resetGame} />
            </div>
            :
            <div className='menumain' style={!window.walletConnection.isSignedIn() ? { maxWidth: "860px" } : { maxWidth: "650px" }}>


              <h1 className="textsurprese font-weight-normal" style={{ fontSize: "1.5rem" }}>{surprisePhrase}</h1>
              <div className='maincenter text-center'>

                {!window.walletConnection.isSignedIn() ?
                  <>
                    <img src={showDoggo ? LOGODOG : LOGOMAIN} className="logo mx-auto" alt="logo" width="240" height="240" />
                  </> :
                  <div className='d-flex flex-column '>
                    <h4 className='mt-1 mt-sm-1' fontSize="1.3rem">I like...</h4>

                    <div className="flip-box logo mb-2 mx-auto">
                      <div className={tailsHeads === "heads" ? "flip-box-inner" : "flip-box-inner-flipped"}>
                        <div className="flip-box-front">
                          <img src={showDoggo ? LOGODOG : LOGOMAIN} alt="logo" width="240" height="240" onClick={() => { toggleHeadsTails(); }} />
                        </div>
                        <div className="flip-box-back">
                          <img src={LOGOBACK} alt="logoback" width="240" height="240" onClick={() => { toggleHeadsTails(); }} />
                        </div>
                      </div>


                    </div>


                    <div id="game" className="game">
                      <h4 className="start text-uppercase mb-3">insert coin</h4>
                    </div>

                    <div className="row">
                      <div className="col-4">

                        <button className={ammoutNEAR === "0.5" ? "button button-retro is-selected" : "button button-retro is-warning"} onClick={() => setPrice("0.5")}>0.5 NEAR</button>
                      </div>
                      <div className="col-4">
                        <button className={ammoutNEAR === "1" ? "button button-retro is-selected" : "button button-retro is-warning"} onClick={() => setPrice("1")}>1 NEAR</button>
                      </div>
                      <div className="col-4">
                        <button className={ammoutNEAR === "2.5" ? "button button-retro is-selected" : "button button-retro is-warning"} onClick={() => setPrice("2.5")}>2.5 NEAR</button>

                      </div>

                    </div>
                    <div className="row mt-3">
                      <div className="col-4">
                        <button className={ammoutNEAR === "5.0" ? "button button-retro is-selected" : "button button-retro is-warning"} onClick={() => setPrice("5.0")}>5.0 NEAR</button>

                      </div>
                      <div className="col-4">
                        <button className={ammoutNEAR === "7.5" ? "button button-retro is-selected" : "button button-retro is-warning"} onClick={() => setPrice("7.5")}>7.5 NEAR</button>

                      </div>
                      <div className="col-4">
                        <button className={ammoutNEAR === "10" ? "button button-retro is-selected" : "button button-retro is-warning"} onClick={() => setPrice("10")}>10 NEAR</button>

                      </div>
                    </div>

                    <hr />
                    <button
                      className="button button-retro is-warning"
                      onClick={event => {
                        setButtonDisabled(true);
                        setprocessing(true);
                        //console.log(tailsHeads);
                        //console.log(ammoutNEAR);
                        flip(tailsHeads === "heads", ammoutNEAR)

                        /*code doesnt reach here*/
                      }}
                      disabled={buttonDisabled || tailsHeads === "" || ammoutNEAR === ""}
                    >{processing ? <Loading size={"1.5rem"} color={"text-warning"} /> : "Flip!"}</button>

                  </div>
                }
              </div>
            </div>
          }
        </div>
        {!window.walletConnection.isSignedIn() ? <NotLogged /> : <></>}
      </div>
      <div className="social-icons-bottom-right">
        <div className="d-flex flex-row flex-sm-column justify-content-start align-items-center h-100"><div className="mt-3 d-flex flex-column shortcut-row">
          <div className="text-center justify-content-center d-flex">
            <a href="" target="_blank" rel="" className="cursor-pointer me-2">
              {darkMode === "light" ?
                <img src={ParasLogoW} alt="Paras Logo W " className='rounded mt-1 fa-nearnfts' style={{ height: "28px", width: "28px" }} /> : <img src={ParasLogoB} alt="Paras Logo B" className='rounded mt-1 fa-nearnfts' style={{ height: "28px", width: "28px" }}
                />}
            </a>
            <a href="" target="_blank" rel="" className="cursor-pointer me-2">
              <Twitter color="#1da1f2" size={30} className="rounded mt-1 fa-twitter" />
            </a>
            <a href="https://discord.gg/b7NJPuV5pk" target="_blank" rel="" className="cursor-pointer me-2">
              <Discord color="#5865f2" size={31} className="rounded mt-1 fa-discord" />
            </a>
          </div>
        </div>
        </div>
      </div>
      <div className="social-icons-left">
        <div className="d-flex flex-row flex-sm-column justify-content-start align-items-center h-100">
          <div className="mt-3 d-flex flex-column">
            <div className="d-flex flex-row mb-2 toolbar">
              {/*}
              <button className="ms-2 btn btn-outline-dark" style={{fontSize:"0.7rem"}} >
                {darkMode==="light" ? "DARK" : "LIGHT"} {darkMode==="light" ? <Moon className="fa-xs fas mb-1"/>: <Sun className="fa-xs fas mb-1"/> }
      </button>*/}
            </div>
          </div>
        </div>
      </div>

    </div>

  )
}

// this component gets rendered by App after the form is submitted
export function Notification() {
  const urlPrefix = "https://explorer." + networkId + ".near.org/accounts"
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      <span style={{ color: "#f5f5f5" }}>called method in contract:</span>
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>Just now</div>
      </footer>
    </aside>
  )
}

export function NotificationError(props) {
  const urlPrefix = "https://explorer." + networkId + ".near.org/accounts";

  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      tried to call a method in Contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div className='err'>❌ Error: <span style={{ color: "white" }}>{props.err}</span></div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}

function FlipCoin(props) {

  const [processing, setprocessing] = React.useState(true);



  React.useEffect(() => {
    // The HTML for the coins to use
    var container = $("#cointainer"); //canvas area
    var $coinBox = $("#coinBox");
    var coinTl = new TimelineMax(); // master timeline
    var jumpTime = (Math.random() * .75) + .8;

    // The HTML for the coins to use
    var template = $(".template").remove();

    var count = 1;
    var coins = createCoins(count);


    // Returns an array of coin objects
    function createCoins(count) {

      var coins = [];

      for (var i = 0; i < count; i++) {

        // Copy the template
        var clone = template.clone().attr("class", "coinBox");
        container.append(clone);

        // Finds the images inside the clone
        var img = clone.find("img");

        var coin = {
          index: i,
          box: clone,
          heads: img[0],
          edge: img[1],
          line: img[2],
          tails: img[3],
          flip: function (side) {
            side ? headFlip(this) : tailFlip(this);
            return getFlippage(this.box, side);
          }
        };

        coins.push(coin);

        TweenLite.set(clone, { x: i * 100, y: 100, autoAlpha: 1 });
      }

      return coins;
    }
    // Animation setup
    // Animation setup
    function getFlippage(coin, whatSide) {

      //define jumping
      jumpTime = (Math.random() * .75) + .8;
      var jumpTl = new TimelineMax();
      var jumpUp = new TweenMax(coin, jumpTime / 2, {
        y: -100,
        rotation: 10,
        ease: Power1.easeOut
      });
      var jumpDown = new TweenMax(coin, jumpTime / 2, {
        y: 100,
        rotation: -10,
        ease: Bounce.easeOut
      });

      jumpTl
        .add(jumpUp.play())
        .add(jumpDown.play())
        .to(coin, .1, {
          rotation: 0
        }, "-=.2");

      // timeline for each
      var coinFlipTl = new TimelineMax();
      coinFlipTl
        .add(whatSide, 0) //picks whether to land on heads or tails
        .add(jumpTl, 0);
      return coinFlipTl;
    };

    // gets called when you click the button
    function callIt(side) {
      //container.html('');
      coinTl.clear();
      buildTimeline(side);
      //coinTl.seek(0).invalidate().restart(); //don't seem to need this.
    };

    //makes a new animation for a coin that's heads
    //makes a new animation for a coin that's heads
    function headFlip(coin) {

      var flipTime = 1 / 4;
      var headsTl = new TimelineMax({ repeat: 1 });

      headsTl
        .fromTo(coin.heads, flipTime, {
          scaleY: 1,
          y: 0
        }, {
          scaleY: 0,
          y: 0
        }, "headEnd")
        .fromTo(coin.heads, flipTime, {
          scaleY: 1,
          y: 0
        }, {
          scaleY: 0,
          y: 8
        }, "headEnd")
        .fromTo(coin.line, flipTime, {
          height: 0,
          y: 0
        }, {
          height: 8,
          y: 0
        }, "headEnd")

        .to(coin.heads, 0, {
          y: 0
        }, "tailStart")
        .fromTo(coin.tails, flipTime, {
          opacity: 1,
          scaleY: 0,
          y: 8
        }, {
          opacity: 1,
          scaleY: 1,
          y: 0
        }, "tailStart")
        .to(coin.edge, flipTime, {
          scaleY: 1,
          y: 0
        }, "tailStart")
        .to(coin.line, flipTime, {
          height: 0,
          y: 0
        }, "tailStart")

        .to(coin.tails, flipTime, {
          scaleY: 0
        }, "tailEnd")
        .fromTo(coin.edge, flipTime, {
          scaleY: 1,
          y: 0
        }, {
          scaleY: 0,
          y: 8
        }, "tailEnd")
        .to(coin.line, flipTime, {
          height: 8,
          y: 0
        }, "tailEnd")
        .fromTo(coin.heads, flipTime, {
          scaleY: 0,
          y: 8
        }, {
          scaleY: 1,
          y: 0
        }, "headStart")
        .fromTo(coin.edge, flipTime, {
          scaleY: 0,
          y: 0
        }, {
          scaleY: 1,
          y: 0
        }, "headStart")
        .to(coin.line, flipTime, {
          height: 0,
          y: 0
        }, "headStart");

      return headsTl;
    };

    //makes a new animation for a coin that's tails
    function tailFlip(coin) {

      var flipTime = 1 / 3;
      var tailsTl = new TimelineMax({ repeat: 1 });

      tailsTl
        .fromTo(coin.heads, flipTime, {
          scaleY: 1,
          y: 0
        }, {
          scaleY: 0,
          y: 0
        }, "headEnd2")
        .fromTo(coin.edge, flipTime, {
          scaleY: 1,
          y: 0
        }, {
          scaleY: 0,
          y: 8
        }, "headEnd2")
        .fromTo(coin.line, flipTime, {
          height: 0,
          y: 0
        }, {
          height: 8,
          y: 0
        }, "headEnd2")

        .to(coin.edge, 0, {
          y: 0
        }, "tailStart2")
        .fromTo(coin.tails, flipTime, {
          opacity: 1,
          scaleY: 0,
          y: 8
        }, {
          opacity: 1,
          scaleY: 1,
          y: 0
        }, "tailStart2")
        .to(coin.edge, flipTime, {
          scaleY: 1,
          y: 0
        }, "tailStart2")
        .to(coin.line, flipTime, {
          height: 0,
          y: 0
        }, "tailStart2");

      return tailsTl;
    };

    function buildTimeline(side) {

      // forEach is an array method
      coins.forEach(function (coin) {
        coinTl.add(coin.flip(side), 0);
      });
    };

    setTimeout(function () {
      callIt(props.tailsHeads === "heads");

    }, 1000);

    setTimeout(function () {
      setprocessing(false);
    }, 3000);
  }, []);

  res = () => {
    props.reset();
  }

  return (
    <>
      <div id="cointainer" className='mx-auto  w-full h-full'>
        <div className="template" style={{ visibility: "hidden" }}>
          <img className="coinHeads" src={LOGOMAIN} />
          <img className="coinEdge" src="http://www.joshworth.com/dev/78coins/img/cf/coin-edge.svg" />
          <img className="coinLine" src="http://www.joshworth.com/dev/78coins/img/cf/coin-line.svg" />
          <img className="coinTails" src={LOGOBACK} />
        </div>
      </div>
      <div className={processing === false ? 'fadein' : 'fadein fadeout'}>
        {props.won === "true" ? <>

          <Confetti
            width={props.width - 1}
            height={props.height - 1}
          />

          <div className="textinfowin font-weight-normal mb-2" style={{ fontSize: "2rem" }}>
            YOU WON!
          </div>

          <button className="button button-retro is-primary" onClick={res}>
            Play Again
          </button>
        </>
          :
          <>
            <div className="textinfolose font-weight-normal" style={{ fontSize: "2rem" }}>
              Game Over!
            </div>
            <button className="button button-retro is-error mb-2" onClick={this.res}>
              Try Again
            </button>
          </>
        }
      </div>
    </>
  );
}



