import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "./Home.css"

const Center = () => {
  const search = (baseRate = "USD", otherRate = "CNY,RUB") =>{
    return new Promise((resolve,reject)=>{
      axios({
        method:'GET',
        headers:{
          'Content-Type':'application/json;charset=UTF-8'
        },
        url:`https://api.exchangerate.host/latest?base=${baseRate}&symbols=${otherRate}`,
        data:{
        }
      }).then(res=>{
        if (res) {
          const { base, rates } = res.data;
          resolve({base, rates})
        }
      }).catch(err=>{
         reject(err)
      })
    }).then(res=>{
      return res;
    })
  }

  const RUBrate = useRef({})
  const CNYrate = useRef({})
  const USDrate = useRef({})
  const [currentRate, setCurrentRate] = useState({})

  const loadRate = async () => {
    RUBrate.current = await search("CNY", "USD,RUB", RUBrate);
    CNYrate.current = await search("USD", "CNY,RUB", CNYrate);
    USDrate.current = await search("RUB", "CNY,USD",USDrate);
    setCurrentRate({
      RUBrate: RUBrate.current,
      CNYrate: CNYrate.current,
      USDrate: USDrate.current
    })
  }

  useEffect(()=>{
    loadRate()
  },[1])

  const [planObject, setPlanObject] = useState(
    {
      checked: false,
      planTitle: "",
      price: 0.00,
      RUBprice: 0.00,
      CNYprice: 0.00,
      USDprice: 0.00,
      currencyType: "货币类型"
    })
  
  const [planList, setPlanList] = useState([]);
  const [completePlanList, setCompletePlanList] = useState([]);
  const delPlanObject = useRef([])
  const operaType = useRef("plan")

  const checkedChange = (index,type) => {
    let delPlanList = type === "plan"? JSON.parse(JSON.stringify(planList)) 
      : JSON.parse(JSON.stringify(completePlanList))
    delPlanObject.current = delPlanList.splice(index,1)
    if (type === "plan") {
      operaType.current = "plan"
      setPlanList(delPlanList)
    } else {
      operaType.current = "cmpPlan"
      setCompletePlanList(delPlanList)
    }
  }

  useEffect(() => {
    let cmpArr = operaType.current === "plan" ? completePlanList : planList;
    cmpArr.push(...delPlanObject.current);
    if (operaType.current === "plan") {
      setCompletePlanList([...cmpArr])
    } else {
      setPlanList([...cmpArr])
    }
    console.log("completePlanList", completePlanList)
  }, [delPlanObject.current])

  const addPlanData = () => {
    const {currencyType, planTitle, price} = planObject;
    if (currencyType === "货币类型") {
      alert("请选择一种计价货币");
      return
    }
    if (planTitle === "" || planTitle === undefined || planList === null) {
      alert("标题未填写");
      return
    }
    if (price === "" || planTitle === undefined || planList === null || price === 0) {
      alert("价格未填写");
      return
    }
    console.log("currencyType, planTitle, price", currencyType, planTitle, price)
    let prePlanList = JSON.parse(JSON.stringify(planList));
    prePlanList.push(planObject)
    prePlanList = prePlanList.map(_ => {
     return _?.currencyType === "卢布"? {..._, RUBprice:_.price,
        CNYprice: ((_.price) * (currentRate?.USDrate?.rates?.CNY)).toFixed(6),
        USDprice: ((_.price) * (currentRate?.USDrate?.rates?.USD)).toFixed(6)
      }: _?.currencyType === "人民币"? {
        ..._, RUBprice: ((_.price) * (currentRate?.RUBrate?.rates?.RUB)).toFixed(6),
        CNYprice: _.price,
        USDprice: ((_.price) * (currentRate?.CNYrate?.rates?.CNY)).toFixed(6)
      } : {
        ..._,
        RUBprice: ((_.price) * (currentRate?.RUBrate?.rates?.RUB)).toFixed(6),
        CNYprice: ((_.price) * (currentRate?.CNYrate?.rates?.CNY)).toFixed(6),
        USDprice: _.price
      }
    })
    setPlanList(prePlanList);
    setPlanObject({
        ...planObject,
        checked: false,
        planTitle: "",
        price: 0,
        RUBprice: 0,
        CNYprice: 0,
        USDprice: 0,
        currencyType: "货币类型"
      })
  }
  
  return (
    <>
      <div className='main-preview'>
        <div className='first-list'>
          <input placeholder='任务' 
            value={planObject.planTitle} 
            onChange={(e) => {
            setPlanObject({...planObject,
              planTitle: e.target.value
            })
          }}></input>
          <input placeholder='价格' 
          value={planObject.price} 
          onChange={(e) => {
            setPlanObject({...planObject,
              price: e.target.value
            })
          }}></input>
          <select
          value={planObject.currencyType} 
          onChange={(e) => {
            setPlanObject({...planObject,
              currencyType: e.target.value
            })
          }}>
            <option disabled value={"货币类型"}>-货币类型-</option>
            <option value={"卢布"}>卢布</option>
            <option value={'人民币'}>人民币</option>
            <option value={'美元'}>美元</option>
          </select>
          <button
            onClick={addPlanData}
          >添加</button>
        </div>
        <div className='second-list'>
           <span>{currentRate?.RUBrate?.rates?.RUB} ₽/¥</span>
           <span>{currentRate?.CNYrate?.rates?.RUB} ₽/$</span>
           <span>{currentRate?.CNYrate?.rates?.CNY} ¥/$</span> 
        </div>
        <div className='third-list-title'>计划:</div>
        <div className='third-list'>
          {planList.map((item, index) => (
            <ul key={`planid-${index}`}>
                <li>
                    <input type={"checkbox"}
                      value={item.checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newPlist = planList.map((_, idx) => {
                            if (idx === index) {
                              _.checked = true
                            }
                            return _
                          })
                          setPlanList(newPlist)
                          checkedChange(index, "plan")
                        }
                      }}
                    ></input>
                    <span> {item.planTitle}</span>
                </li>
                <li>
                    {item.RUBprice}
                </li>
                <li>
                    {item.CNYprice}
                </li>
                <li>
                  {item.USDprice}
                </li>
            </ul>
          ))}
          <ul>
            <li>
              将要花费:
            </li>
            <li>₽{
                planList.reduce((pre,n) => {
                  return (Number(pre) + Number(n.RUBprice)).toFixed(6) 
                },0)
              }</li>
            <li>¥{
              planList.reduce((pre,n) => {
                return (Number(pre) + Number(n.CNYprice)).toFixed(6)
              },0)
              }</li>
            <li>${
                planList.reduce((pre,n) => {
                  return (Number(pre) + Number(n.USDprice)).toFixed(6)
                },0)
              }</li>
          </ul>
        </div>

        <div className='third-list-title'>已完成:</div>
        <div className='third-list'>
          {
            completePlanList.map((_, indx) => (
              <ul key={`cmplanid-${indx}`}>
                <li>
                  <input type={"checkbox"}
                    value={_.checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newPlist = completePlanList.map((_, idx) => {
                          if (idx === indx) {
                            _.checked = true
                          }
                          return _
                        })
                        setCompletePlanList(newPlist)
                        checkedChange(indx, "cmpPlan")
                      }
                    }}
                  ></input>
                  <span className='clearText'> {_.planTitle}</span>
                </li>
                <li>
                    {_.RUBprice}
                </li>
                <li>
                    {_.CNYprice}
                </li>
                <li>
                  {_.USDprice}
                </li>
              </ul>
            ))
          }
          
          <ul>
            <li>
              一共花了:
            </li>
            <li>₽{
                completePlanList.reduce((pre,n) => {
                  return (Number(pre) + Number(n.RUBprice)).toFixed(6) 
                },0)
              }</li>
            <li>¥{
              completePlanList.reduce((pre,n) => {
                return (Number(pre) + Number(n.CNYprice)).toFixed(6)
              },0)
              }</li>
            <li>${
                completePlanList.reduce((pre,n) => {
                  return (Number(pre) + Number(n.USDprice)).toFixed(6)
                },0)
              }</li>
          </ul>
        </div>
      </div>
      
    </>
  );
};


export default Center;
