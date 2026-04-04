(function(){
  function ownKeys(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,o)}return r}
  function _objectSpread2(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(r),!0).forEach(function(t){_defineProperty(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}
  function _defineProperty(e,t,r){return(t=_toPropertyKey(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}
  function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==typeof i?i:i+""}
  function _toPrimitive(t,r){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}
  const STORAGE_KEY="entrenador_virtual_state_v3";
  const API_BASE="/api";
  const DEFAULT_CHECKIN_VALUES={
    bodyweight:80,
    sleep_hours:7.5,
    readiness:7,
    available_time_min:90,
    session_type_planned:"specific_aw",
    medial_elbow_right:2,
    global_fatigue:4,
    forearm_hand_fatigue:4,
    back_fatigue:3,
    legs_fatigue:3
  };
  const DEFAULT_SESSION_VALUES={
    session_type:"specific_aw",
    goal_of_session:"toproll_refuerzo",
    effort_rpe_session:8,
    best_pattern:"pronacion_media",
    best_grip_condition:"medio_neutro",
    main_limitation:"rising",
    medial_pain:2,
    could_stop:!0,
    could_move:!0,
    could_finish:!1
  };
  const DEFAULT_EXERCISE_TEMPLATES=[
    {
      exercise_name:"dominada_neutra_grip_grueso",
      category:"back_pressure",
      pattern:"vertical_pull",
      side:"bilateral",
      load:25,
      load_unit:"kg",
      effort_type:"dynamic",
      sets:3,
      reps:5,
      duration_seconds:0,
      rpe:8.5,
      pain_during:2,
      vector_quality:0.88,
      technique_quality:0.9,
      notes:"base"
    },
    {
      exercise_name:"pronacion_media",
      category:"pronation",
      pattern:"pronation",
      side:"right",
      load:35,
      load_unit:"kg",
      effort_type:"dynamic",
      sets:3,
      reps:6,
      duration_seconds:0,
      rpe:8.5,
      pain_during:2,
      vector_quality:0.87,
      technique_quality:0.88,
      notes:"base"
    }
  ];
  function isObject(value){
    return value!==null&&typeof value==="object"&&!Array.isArray(value)
  }
  function todayText(){
    return new Date().toISOString().slice(0,10)
  }
  function clampNumber(value,min,max,fallback=0){
    const numeric=Number(value);
    if(!Number.isFinite(numeric)){
      return fallback
    }
    return Math.min(max,Math.max(min,numeric))
  }
  function round(value,digits=1){
    const factor=10**digits;
    return Math.round((Number(value)||0)*factor)/factor
  }
  function deepClone(value){
    return JSON.parse(JSON.stringify(value))
  }
  function escapeHtml(value){
    return String(value??"")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#39;")
  }
  function formatDecimal(value,digits=1){
    const numeric=Number(value);
    return Number.isFinite(numeric)?numeric.toFixed(digits):"0.0"
  }
  function formatUiText(value){
    return String(value??"")
      .replaceAll("_"," ")
      .replace(/\b\w/g,(letter)=>letter.toUpperCase())
  }
  function ensureArray(value,fallback=[]){
    return Array.isArray(value)?value:fallback
  }
  function safeLower(value){
    return String(value??"").trim().toLowerCase()
  }
  function buildStorageEnvelope(data,source="seed"){
    return {
      athleteProfile:data.athleteProfile,
      dailyCheckins:ensureArray(data.dailyCheckins),
      sessions:ensureArray(data.sessions),
      exerciseEntries:ensureArray(data.exerciseEntries),
      exerciseRecords:ensureArray(data.exerciseRecords),
      storage:{
        source,
        lastSyncAt:new Date().toISOString()
      }
    }
  }
  function createSeedData(){
    return buildStorageEnvelope({
      athleteProfile:{
        athlete_id:"edgar-garcia",
        name:"Edgar Garcia",
        dominantGoal:"Campeon Nacional 80kg Ambos Brazos",
        secondaryGoal:"Maximizar Fuerza Bruta Transferible"
      },
      dailyCheckins:[
        {
          date:"2026-03-29",
          bodyweight:80,
          sleep_hours:7.5,
          readiness:7,
          available_time_min:90,
          pain:{medial_elbow_right:2},
          fatigue:{global:4,forearm_hand:4,back:3,legs:3},
          session_type_planned:"specific_aw"
        }
      ],
      sessions:[
        {
          session_id:"2026-03-29-aw-01",
          date:"2026-03-29",
          session_type:"specific_aw",
          goal_of_session:"toproll_refuerzo",
          effort_rpe_session:9.2,
          results:{
            best_pattern:"back_pressure_y_pronacion",
            best_grip_condition:"medio_neutro",
            main_limitation:"rising",
            could_stop:!0,
            could_move:!0,
            could_finish:!1
          },
          pain_events:[
            {
              zone:"medial_elbow_right",
              type:"irritability",
              severity:2,
              during:"specific_aw",
              resolved_with:"continuar_controlado"
            }
          ],
          exercise_entry_count:4,
          recommendation_label_before_session:"Recuperacion Y Tolerancia"
        }
      ],
      exerciseEntries:[
        {
          entry_id:"2026-03-29-aw-01-ex-01",
          session_id:"2026-03-29-aw-01",
          date:"2026-03-29",
          exercise_name:"rising_isometrico",
          category:"rising",
          pattern:"isometric_hold",
          side:"left",
          load:27.5,
          load_unit:"kg",
          effort_type:"isometric_hold",
          sets:3,
          reps:1,
          duration_seconds:25,
          rpe:8.8,
          pain_during:2,
          vector_quality:0.9,
          technique_quality:0.9,
          confirmed_rm:!1,
          notes:"seed"
        },
        {
          entry_id:"2026-03-29-aw-01-ex-02",
          session_id:"2026-03-29-aw-01",
          date:"2026-03-29",
          exercise_name:"rising_isometrico",
          category:"rising",
          pattern:"isometric_hold",
          side:"right",
          load:27.5,
          load_unit:"kg",
          effort_type:"isometric_hold",
          sets:3,
          reps:1,
          duration_seconds:30,
          rpe:9,
          pain_during:2,
          vector_quality:0.9,
          technique_quality:0.9,
          confirmed_rm:!1,
          notes:"seed"
        },
        {
          entry_id:"2026-03-29-aw-01-ex-03",
          session_id:"2026-03-29-aw-01",
          date:"2026-03-29",
          exercise_name:"pronacion_extendida",
          category:"pronation",
          pattern:"pronation",
          side:"left",
          load:30,
          load_unit:"kg",
          effort_type:"dynamic",
          sets:3,
          reps:10,
          duration_seconds:0,
          rpe:8.5,
          pain_during:2,
          vector_quality:0.88,
          technique_quality:0.88,
          confirmed_rm:!1,
          notes:"seed"
        },
        {
          entry_id:"2026-03-29-aw-01-ex-04",
          session_id:"2026-03-29-aw-01",
          date:"2026-03-29",
          exercise_name:"pronacion_extendida",
          category:"pronation",
          pattern:"pronation",
          side:"right",
          load:32.5,
          load_unit:"kg",
          effort_type:"dynamic",
          sets:3,
          reps:10,
          duration_seconds:0,
          rpe:8.7,
          pain_during:2,
          vector_quality:0.89,
          technique_quality:0.89,
          confirmed_rm:!1,
          notes:"seed"
        },
        {
          entry_id:"2026-03-29-aw-01-ex-05",
          session_id:"2026-03-29-aw-01",
          date:"2026-03-29",
          exercise_name:"pronacion_media",
          category:"pronation",
          pattern:"pronation",
          side:"left",
          load:35,
          load_unit:"kg",
          effort_type:"dynamic",
          sets:3,
          reps:6,
          duration_seconds:0,
          rpe:8.5,
          pain_during:2,
          vector_quality:0.87,
          technique_quality:0.88,
          confirmed_rm:!1,
          notes:"seed"
        },
        {
          entry_id:"2026-03-29-aw-01-ex-06",
          session_id:"2026-03-29-aw-01",
          date:"2026-03-29",
          exercise_name:"pronacion_media",
          category:"pronation",
          pattern:"pronation",
          side:"right",
          load:37.5,
          load_unit:"kg",
          effort_type:"dynamic",
          sets:3,
          reps:5,
          duration_seconds:0,
          rpe:8.7,
          pain_during:2,
          vector_quality:0.88,
          technique_quality:0.88,
          confirmed_rm:!1,
          notes:"seed"
        }
      ],
      exerciseRecords:[
        {
          exerciseName:"rising_isometrico",
          side:"left",
          recordLabel:"27.5 kg x 25 S",
          nextTargetLabel:"27.5 kg x 30 S",
          currentRmKg:null,
          durationSeconds:25,
          progressionAction:"hold",
          bestSet:{load:27.5,loadUnit:"kg",reps:1,durationSeconds:25,sets:3},
          category:"rising",
          pattern:"isometric_hold",
          effortType:"isometric_hold"
        },
        {
          exerciseName:"rising_isometrico",
          side:"right",
          recordLabel:"27.5 kg x 30 S",
          nextTargetLabel:"30 kg x 25 S",
          currentRmKg:null,
          durationSeconds:30,
          progressionAction:"increase",
          bestSet:{load:27.5,loadUnit:"kg",reps:1,durationSeconds:30,sets:3},
          category:"rising",
          pattern:"isometric_hold",
          effortType:"isometric_hold"
        },
        {
          exerciseName:"pronacion_extendida",
          side:"left",
          recordLabel:"30 kg x 10 Reps",
          nextTargetLabel:"32.5 kg x 8 Reps",
          currentRmKg:40,
          durationSeconds:0,
          progressionAction:"increase",
          bestSet:{load:30,loadUnit:"kg",reps:10,durationSeconds:0,sets:3},
          category:"pronation",
          pattern:"pronation",
          effortType:"dynamic"
        },
        {
          exerciseName:"pronacion_extendida",
          side:"right",
          recordLabel:"32.5 kg x 10 Reps",
          nextTargetLabel:"35 kg x 8 Reps",
          currentRmKg:43,
          durationSeconds:0,
          progressionAction:"increase",
          bestSet:{load:32.5,loadUnit:"kg",reps:10,durationSeconds:0,sets:3},
          category:"pronation",
          pattern:"pronation",
          effortType:"dynamic"
        },
        {
          exerciseName:"pronacion_media",
          side:"left",
          recordLabel:"35 kg x 6 Reps",
          nextTargetLabel:"37.5 kg x 5 Reps",
          currentRmKg:42,
          durationSeconds:0,
          progressionAction:"increase",
          bestSet:{load:35,loadUnit:"kg",reps:6,durationSeconds:0,sets:3},
          category:"pronation",
          pattern:"pronation",
          effortType:"dynamic"
        },
        {
          exerciseName:"pronacion_media",
          side:"right",
          recordLabel:"37.5 kg x 5 Reps",
          nextTargetLabel:"40 kg x 5 Reps",
          currentRmKg:45,
          durationSeconds:0,
          progressionAction:"increase",
          bestSet:{load:37.5,loadUnit:"kg",reps:5,durationSeconds:0,sets:3},
          category:"pronation",
          pattern:"pronation",
          effortType:"dynamic"
        }
      ]
    },"sqlite")
  }
  function safeRender(block){
    try{
      return block()
    }catch(error){
      console.error("Fallo de render protegido.",error);
      return false
    }
  }
  async function requestJson(url,options={}){
    const response=await fetch(`${API_BASE}${url}`,_objectSpread2({
      headers:{"Content-Type":"application/json"}
    },options));
    if(!response.ok){
      const text=await response.text();
      throw new Error(text||`Request failed: ${response.status}`)
    }
    return response.json()
  }
  async function loadServerMeta(){
    try{
      return await requestJson("/meta",{method:"GET"})
    }catch(error){
      return {mode:"demo",strictAvailable:false,error:error.message}
    }
  }
  async function loadStrictConfig(){
    return requestJson("/codex-config/strict",{method:"GET"})
  }
  async function loadSimulationCycle(){
    return requestJson("/simulation-cycle",{method:"GET"})
  }
  async function loadIPPCycle(){
    return requestJson("/ipp-cycle",{method:"GET"})
  }
  async function loadAppData(serverMeta=null){
    const meta=serverMeta||await loadServerMeta();
    try{
      const payload=await requestJson("/app-data",{method:"GET"});
      return ensureShape(payload,{athleteProfile:null,dailyCheckins:[],sessions:[],exerciseEntries:[],exerciseRecords:[],storage:{source:"sqlite",lastSyncAt:new Date().toISOString()}})
    }catch(error){
      if(meta?.mode==="strict"){
        throw error
      }
      return createSeedData()
    }
  }
  function ensureShape(payload,fallback){
    if(!isObject(payload)){
      return deepClone(fallback)
    }
    return _objectSpread2(_objectSpread2({},deepClone(fallback)),payload)
  }
  function parseJsonSafely(text,fallback=null){
    try{return JSON.parse(text)}catch(error){return fallback}
  }
  function loadLocalState(){
    try{
      const raw=window.localStorage.getItem(STORAGE_KEY);
      if(!raw){
        return createSeedData()
      }
      return ensureShape(parseJsonSafely(raw,{}),createSeedData())
    }catch(error){
      console.warn("No fue posible leer localStorage.",error);
      return createSeedData()
    }
  }
  function persistLocalState(data){
    try{
      window.localStorage.setItem(STORAGE_KEY,JSON.stringify(data))
    }catch(error){
      console.warn("No fue posible escribir localStorage.",error)
    }
  }
  function sortByDateDescending(entries){
    return ensureArray(entries).slice().sort((left,right)=>String(right.date||"").localeCompare(String(left.date||"")))
  }
  function buildCurrentState(athleteProfile,sessions,latestCheckin,exerciseEntries){
    if(!latestCheckin){
      return null
    }
    const pain=Number(latestCheckin?.pain?.medial_elbow_right||0);
    const readiness=Number(latestCheckin?.readiness||0);
    const fatigueGlobal=Number(latestCheckin?.fatigue?.global||0);
    const fatigueForearm=Number(latestCheckin?.fatigue?.forearm_hand||0);
    const sessionGapDays=sessions?.length>1?Math.max(0,Math.round((new Date(`${sessions[0].date}T12:00:00`)-new Date(`${sessions[1].date}T12:00:00`))/864e5)):2;
    const continuityConfidence=Math.max(.15,Math.min(1,1-.12*Math.max(0,sessionGapDays-1)));
    return {
      athleteId:athleteProfile?.athlete_id||"unknown",
      date:latestCheckin.date,
      medialPainToday:pain,
      readiness,
      fatigueGlobal,
      fatigueForearm,
      availableTimeMin:Number(latestCheckin.available_time_min||0),
      sessionGapDays,
      continuityConfidence,
      stableBase:Boolean(exerciseEntries?.length)
    }
  }
  function buildEntryStrengthMetrics(entry){
    const load=Number(entry.load||0);
    const reps=Number(entry.reps||0);
    const duration=Number(entry.duration_seconds||0);
    const effortType=entry.effort_type||"dynamic";
    const estimatedRmKg=effortType==="isometric_hold"?null:round(load*(1+reps/30),1);
    return {
      load,
      reps,
      durationSeconds:duration,
      effortType,
      estimatedRmKg,
      score:effortType==="isometric_hold"?load*Math.max(1,duration/20):load*Math.max(1,reps)
    }
  }
  function buildExerciseRecords(exerciseEntries){
    const byKey=new Map();
    for(const entry of ensureArray(exerciseEntries)){
      const metrics=buildEntryStrengthMetrics(entry);
      const key=`${safeLower(entry.exercise_name)}::${safeLower(entry.side)}`;
      const current=byKey.get(key);
      if(!current||metrics.score>current.score){
        const recordLabel=metrics.effortType==="isometric_hold"?`${formatDecimal(metrics.load,1)} kg x ${metrics.durationSeconds} S`:`${formatDecimal(metrics.load,1)} kg x ${metrics.reps} Reps`;
        let nextTargetLabel=recordLabel;
        let progressionAction="hold";
        if(metrics.effortType==="isometric_hold"){
          progressionAction=metrics.durationSeconds>=30?"increase":"hold";
          nextTargetLabel=progressionAction==="increase"?`${formatDecimal(metrics.load+2.5,1)} kg x 25 S`:`${formatDecimal(metrics.load,1)} kg x ${metrics.durationSeconds+5} S`
        }else{
          progressionAction=metrics.reps>=8?"increase":"hold";
          nextTargetLabel=progressionAction==="increase"?`${formatDecimal(metrics.load+2.5,1)} kg x ${Math.max(5,metrics.reps-2)} Reps`:`${formatDecimal(metrics.load,1)} kg x ${metrics.reps+1} Reps`
        }
        byKey.set(key,{
          exerciseName:entry.exercise_name,
          side:entry.side,
          recordLabel,
          nextTargetLabel,
          currentRmKg:metrics.estimatedRmKg,
          durationSeconds:metrics.durationSeconds,
          progressionAction,
          bestSet:{
            load:metrics.load,
            loadUnit:entry.load_unit||"kg",
            reps:metrics.reps,
            durationSeconds:metrics.durationSeconds,
            sets:Number(entry.sets||1)
          },
          category:entry.category,
          pattern:entry.pattern,
          effortType:metrics.effortType,
          score:metrics.score
        })
      }
    }
    return Array.from(byKey.values()).sort((a,b)=>safeLower(a.exerciseName).localeCompare(safeLower(b.exerciseName))||safeLower(a.side).localeCompare(safeLower(b.side)))
  }
  function buildPerformanceSnapshot(athleteProfile,latestCheckin,context,recommendation,weeklyDashboard,postSessionInsight,exerciseEntries,exerciseRecords){
    return {
      title:`${athleteProfile?.name||"Atleta"}`,
      subtitle:athleteProfile?.dominantGoal||"Sin objetivo",
      focus:weeklyDashboard?.recommendedFocus||recommendation?.session_recommendation?.label||"Sin foco",
      pain:latestCheckin?.pain?.medial_elbow_right||0,
      readiness:latestCheckin?.readiness||0,
      metrics:[
        {label:"Readiness",value:latestCheckin?.readiness||"Sin dato"},
        {label:"Dolor medial",value:`${latestCheckin?.pain?.medial_elbow_right||0}/10`},
        {label:"Capturas 7d",value:weeklyDashboard?.metrics?.checkinDaysCaptured||0},
        {label:"Hueco max",value:weeklyDashboard?.metrics?.maxCheckinGapDays?`${weeklyDashboard.metrics.maxCheckinGapDays} d`:"0 d"}
      ],
      records:exerciseRecords||buildExerciseRecords(exerciseEntries),
      context,
      recommendation,
      weeklyDashboard,
      postSessionInsight
    }
  }
  function buildAdaptivePerformanceSnapshot(athleteProfile,latestCheckin,latestSession,adaptiveRecommendation,realState,exerciseRecords){
    return {
      title:athleteProfile?.name||"Atleta",
      subtitle:athleteProfile?.dominantGoal||"Sin objetivo",
      focus:adaptiveRecommendation?.currentBlockRecommendation?.suggestedBlockLabel||adaptiveRecommendation?.nextSessionRecommendation?.sessionLabel||"Sin foco",
      pain:latestCheckin?.pain?.medial_elbow_right||0,
      readiness:latestCheckin?.readiness||0,
      metrics:[
        {label:"Readiness",value:latestCheckin?.readiness||"Sin dato"},
        {label:"Dolor medial",value:`${latestCheckin?.pain?.medial_elbow_right||0}/10`},
        {label:"Bloque",value:adaptiveRecommendation?.currentBlockRecommendation?.suggestedBlockLabel||"Sin bloque"},
        {label:"Continuidad",value:realState?.continuityConfidence?formatDecimal(realState.continuityConfidence,2):"Sin dato"}
      ],
      records:exerciseRecords||[]
    }
  }
  function buildSessionInsight(athleteProfile,session,exerciseEntries){
    if(!session){
      return null
    }
    const sessionEntries=ensureArray(exerciseEntries).filter((entry)=>entry.session_id===session.session_id);
    const avgPain=sessionEntries.length?round(sessionEntries.reduce((total,entry)=>total+Number(entry.pain_during||0),0)/sessionEntries.length,1):0;
    return {
      title:formatUiText(session.session_type||"sesion"),
      date:session.date,
      overview:`La sesion dejo ${sessionEntries.length} ejercicios registrados y la limitacion dominante fue ${formatUiText(session?.results?.main_limitation||"sin dato")}.`,
      metrics:{
        totalSets:sessionEntries.reduce((total,entry)=>total+Number(entry.sets||0),0),
        exerciseCount:sessionEntries.length,
        avgPain
      }
    }
  }
  function buildWeeklyDashboard(athleteProfile,dailyCheckins,sessions,exerciseEntries,nowDate){
    const referenceDate=new Date(`${nowDate||todayText()}T12:00:00`);
    const weeklyCheckins=ensureArray(dailyCheckins).filter((entry)=>Math.abs((referenceDate-new Date(`${entry.date}T12:00:00`))/864e5)<=7);
    const avgMedialPain=weeklyCheckins.length?round(weeklyCheckins.reduce((total,entry)=>total+Number(entry?.pain?.medial_elbow_right||0),0)/weeklyCheckins.length,1):0;
    const maxCheckinGapDays=weeklyCheckins.length<2?0:weeklyCheckins.map((entry,index)=>index===0?0:Math.round((new Date(`${weeklyCheckins[index-1].date}T12:00:00`)-new Date(`${entry.date}T12:00:00`))/864e5)).reduce((max,current)=>Math.max(max,current),0);
    const riskFlags=[];
    if(weeklyCheckins.length<3){
      riskFlags.push("faltan capturas recientes; el contexto ya pierde precision")
    }
    if(maxCheckinGapDays>=4){
      riskFlags.push("hay huecos grandes entre sesiones; la progresion puede sobreestimar continuidad")
    }
    if(avgMedialPain>=3){
      riskFlags.push("irritabilidad medial repetida esta semana")
    }
    const positiveSignals=[];
    if(weeklyCheckins.length>=5){
      positiveSignals.push("continuidad de captura util")
    }
    if(avgMedialPain<2.5){
      positiveSignals.push("dolor medial controlado")
    }
    return {
      recommendedFocus:avgMedialPain>=3?"Recuperacion Y Tolerancia":"Consolidacion Y Ataque",
      riskFlags,
      positiveSignals,
      metrics:{
        checkinDaysCaptured:weeklyCheckins.length,
        maxCheckinGapDays,
        avgMedialPain
      }
    }
  }
  function recommendSession(athleteProfile,sessions,latestCheckin,exerciseEntries){
    const pain=Number(latestCheckin?.pain?.medial_elbow_right||0);
    const readiness=Number(latestCheckin?.readiness||0);
    const sessionLabel=pain>=3?"Recuperacion Y Tolerancia":readiness>=7?"Ataque Prioritario":"Consolidacion Tecnica";
    const reason=[];
    if(pain>=3)reason.push("medial_pain_high");
    if(readiness>=7)reason.push("readiness_favorable");
    if(readiness<7)reason.push("need_stable_quality");
    return {
      session_recommendation:{
        label:sessionLabel,
        explanation:pain>=3?"El dolor medial obliga a bajar agresion local y priorizar tolerancia de tejido.":"El contexto actual permite progresar sin forzar el tejido.",
        reason,
        priority_factors:[pain>=3?"tissue_protection":"readiness",pain>=3?"pain_control":"technical_quality"],
        next_priority:pain>=3?"recovery_tissue":"specific_aw"
      }
    }
  }
  function buildRealState({athleteProfile,checkins=[],sessions=[],exerciseEntries=[],exerciseRecords=[],nowDate}){
    const latestCheckin=sortByDateDescending(checkins)[0]||null;
    const latestSession=sortByDateDescending(sessions)[0]||null;
    const records=exerciseRecords?.length?exerciseRecords:buildExerciseRecords(exerciseEntries);
    const sessionGapDays=sessions.length>1?Math.max(0,Math.round((new Date(`${sessions[0].date}T12:00:00`)-new Date(`${sessions[1].date}T12:00:00`))/864e5)):2;
    return {
      athleteId:athleteProfile?.athlete_id||"unknown",
      date:nowDate||latestCheckin?.date||latestSession?.date||todayText(),
      readiness:latestCheckin?.readiness||0,
      medialPainToday:latestCheckin?.pain?.medial_elbow_right||0,
      continuityConfidence:Math.max(.15,Math.min(1,1-.12*Math.max(0,sessionGapDays-1))),
      stableBase:Boolean(records.length),
      records,
      sessionGapDays
    }
  }
  function buildCandidateRoutes({realState,horizonWeeks=24}){
    const pain=Number(realState?.medialPainToday||0);
    const readiness=Number(realState?.readiness||0);
    const baseRoute={
      routeId:"route_primary",
      label:pain>=3?"Ruta Tolerancia":"Ruta Progresion",
      route:{
        blocks:[{blockLabel:pain>=3?"Tolerancia De Tejido":"Desarrollo Ofensivo",scenarioLabel:readiness>=7?"Readiness Alta":"Readiness Media"}],
        predictedSummary:{weakestPredictedFactors:pain>=3?["sidePressure"]:["rising"]}
      },
      reasons:[pain>=3?"Baja agresion local y conserva continuidad":"Mejor transferencia ofensiva con riesgo aceptable"],
      scoreBreakdown:{
        transferToTable:pain>=3?.62:.84,
        offensiveImprovement:pain>=3?.4:.82,
        tissueSustainability:pain>=3?.9:.7,
        continuityRobustness:realState?.continuityConfidence||.5
      },
      totalScore:pain>=3?7.4:8.8
    };
    const altRoute={
      routeId:"route_alternative",
      label:"Ruta Alternativa",
      route:{
        blocks:[{blockLabel:"Consolidacion Tecnica",scenarioLabel:"Continuidad Media"}],
        predictedSummary:{weakestPredictedFactors:["transition_speed"]}
      },
      reasons:["Mantiene calidad tecnica con menor carga total"],
      scoreBreakdown:{transferToTable:.72,offensiveImprovement:.58,tissueSustainability:.82,continuityRobustness:realState?.continuityConfidence||.5},
      totalScore:7.2
    };
    const contRoute={
      routeId:"route_contingency",
      label:"Ruta Contingencia",
      route:{
        blocks:[{blockLabel:"Recuperacion Y Observacion",scenarioLabel:"Dolor O Fatiga"}],
        predictedSummary:{weakestPredictedFactors:["readiness"]}
      },
      reasons:["Fallback seguro si cae el contexto"],
      scoreBreakdown:{transferToTable:.45,offensiveImprovement:.35,tissueSustainability:.94,continuityRobustness:realState?.continuityConfidence||.5},
      totalScore:6.4
    };
    return [baseRoute,altRoute,contRoute]
  }
  function scoreRoutes(candidateRoutes){
    return ensureArray(candidateRoutes).slice().sort((a,b)=>Number(b.totalScore||0)-Number(a.totalScore||0))
  }
  function buildAdaptiveRecommendation({realState,strictSessionPlan,scoredRoutes}){
    const primary=scoredRoutes?.[0]||null;
    const alternative=scoredRoutes?.[1]||null;
    const contingency=scoredRoutes?.[2]||null;
    const pain=Number(realState?.medialPainToday||0);
    return {
      nextSessionRecommendation:{
        sessionLabel:pain>=3?"Recuperacion Y Tolerancia":"Ataque Prioritario",
        primaryExercises:pain>=3?[
          {exerciseName:"rising_isometrico",side:"left",target:"27.5 kg x 25 S",why:"Alineado con Rising, TopRollOffense"},
          {exerciseName:"rising_isometrico",side:"right",target:"27.5 kg x 30 S",why:"Alineado con Rising, TopRollOffense"},
          {exerciseName:"pronacion_extendida",side:"left",target:"30 kg x 10 Reps",why:"Alineado con Pronation, TopRollOffense"},
          {exerciseName:"pronacion_extendida",side:"right",target:"32.5 kg x 10 Reps",why:"Alineado con Pronation, TopRollOffense"}
        ]:[
          {exerciseName:"pronacion_media",side:"right",target:"40 kg x 5 Reps",why:"Transferencia ofensiva prioritaria"}
        ],
        supportiveExercises:[
          {exerciseName:"pronacion_media",side:"left",target:"35 kg x 6 Reps",why:"Soporte de pronacion"},
          {exerciseName:"pronacion_media",side:"right",target:"37.5 kg x 5 Reps",why:"Soporte de pronacion"}
        ],
        restrictions:pain>=3?["Continuidad baja: conviene no elegir una sesion demasiado compleja."]:["Sin restriccion dominante."]
      },
      currentBlockRecommendation:{
        suggestedBlockLabel:pain>=3?"Tolerancia De Tejido":"Desarrollo Ofensivo"
      },
      primaryRoute:primary,
      alternativeRoute:alternative,
      contingencyRoute:contingency,
      explanation:["Strict-planner define lo que hoy si se puede hacer.","La simulacion prioriza lo que mejor sirve a la ruta ganadora.","La recomendacion final reconcilia seguridad inmediata y valor estrategico."],
      ipp:{
        robustnessScore:pain>=3?45.87:53.2,
        setupFragility:pain>=3?.031:.025,
        latentReadiness:pain>=3?7.12:8.1,
        latentTissueIrritability:pain>=3?2:1.4,
        posteriorExpectedSuccess:pain>=3?.667:.74
      },
      ippVersion:"IPP1"
    }
  }
  function getStrictPlan(){
    return {mode:"strict"}
  }
  function isStrictMode(){
    return state.meta?.mode==="strict"
  }
  function getLatestCheckin(data){
    return sortByDateDescending(data?.dailyCheckins||[])[0]||null
  }
  function getLatestSession(data){
    return sortByDateDescending(data?.sessions||[])[0]||null
  }
  function getFeaturedSession(){
    return getLatestSession(state.data)
  }
  function normalizeCheckinFormData(formData){
    return {
      date:formData.get("date")||todayText(),
      bodyweight:round(clampNumber(formData.get("bodyweight"),40,180,80),1),
      sleep_hours:round(clampNumber(formData.get("sleep_hours"),0,14,7.5),1),
      readiness:clampNumber(formData.get("readiness"),0,10,7),
      available_time_min:clampNumber(formData.get("available_time_min"),20,240,90),
      session_type_planned:formData.get("session_type_planned")||"specific_aw",
      pain:{medial_elbow_right:clampNumber(formData.get("medial_elbow_right"),0,10,2)},
      fatigue:{
        global:clampNumber(formData.get("global_fatigue"),0,10,4),
        forearm_hand:clampNumber(formData.get("forearm_hand_fatigue"),0,10,4),
        back:clampNumber(formData.get("back_fatigue"),0,10,3),
        legs:clampNumber(formData.get("legs_fatigue"),0,10,3)
      }
    }
  }
  function normalizeSessionFormData(formData){
    return {
      session_id:`${formData.get("date")||todayText()}-${Date.now()}`,
      date:formData.get("date")||todayText(),
      session_type:formData.get("session_type")||"specific_aw",
      goal_of_session:formData.get("goal_of_session")||"specific_aw",
      effort_rpe_session:round(clampNumber(formData.get("effort_rpe_session"),0,10,8),1),
      results:{
        best_pattern:formData.get("best_pattern")||"sin_dato",
        best_grip_condition:formData.get("best_grip_condition")||"sin_dato",
        main_limitation:formData.get("main_limitation")||"sin_dato",
        could_stop:Boolean(formData.get("could_stop")),
        could_move:Boolean(formData.get("could_move")),
        could_finish:Boolean(formData.get("could_finish"))
      },
      pain_events:[{
        zone:"medial_elbow_right",
        type:"irritability",
        severity:clampNumber(formData.get("medial_pain"),0,10,2),
        during:formData.get("session_type")||"specific_aw",
        resolved_with:"continuar_controlado"
      }],
      exercise_entry_count:0,
      recommendation_label_before_session:state.lastRecommendationLabel||"sin recomendacion"
    }
  }
  function buildExerciseRowHtml(template,index){
    const row=_objectSpread2(_objectSpread2({},DEFAULT_EXERCISE_TEMPLATES[index%DEFAULT_EXERCISE_TEMPLATES.length]),template||{});
    return `
      <article class="exercise-row" data-exercise-row>
        <div class="field-grid">
          <label class="field"><span>Ejercicio</span><input name="exercise_name" type="text" value="${escapeHtml(row.exercise_name)}"></label>
          <label class="field"><span>Categoria</span><input name="category" type="text" value="${escapeHtml(row.category)}"></label>
        </div>
        <div class="field-grid">
          <label class="field"><span>Patron</span><input name="pattern" type="text" value="${escapeHtml(row.pattern)}"></label>
          <label class="field"><span>Lado</span><input name="side" type="text" value="${escapeHtml(row.side)}"></label>
        </div>
        <div class="field-grid">
          <label class="field"><span>Carga</span><input name="load" type="number" step="0.5" value="${escapeHtml(row.load)}"></label>
          <label class="field"><span>Unidad</span><input name="load_unit" type="text" value="${escapeHtml(row.load_unit)}"></label>
        </div>
        <div class="field-grid">
          <label class="field"><span>Tipo</span><input name="effort_type" type="text" value="${escapeHtml(row.effort_type)}"></label>
          <label class="field"><span>Sets</span><input name="sets" type="number" step="1" value="${escapeHtml(row.sets)}"></label>
        </div>
        <div class="field-grid">
          <label class="field"><span>Reps</span><input name="reps" type="number" step="1" value="${escapeHtml(row.reps)}"></label>
          <label class="field"><span>Duracion (s)</span><input name="duration_seconds" type="number" step="1" value="${escapeHtml(row.duration_seconds)}"></label>
        </div>
        <div class="field-grid">
          <label class="field"><span>RPE</span><input name="rpe" type="number" step="0.1" value="${escapeHtml(row.rpe)}"></label>
          <label class="field"><span>Dolor</span><input name="pain_during" type="number" step="0.1" value="${escapeHtml(row.pain_during)}"></label>
        </div>
      </article>
    `
  }
  function parseExerciseRows(){
    return Array.from(elements.exerciseRows?.querySelectorAll("[data-exercise-row]")||[]).map((row,index)=>({
      entry_id:`${elements.sessionDate.value||todayText()}-tmp-${index+1}`,
      session_id:state.pendingSessionId,
      date:elements.sessionDate.value||todayText(),
      exercise_name:row.querySelector('[name="exercise_name"]')?.value||"ejercicio",
      category:row.querySelector('[name="category"]')?.value||"general",
      pattern:row.querySelector('[name="pattern"]')?.value||"general",
      side:row.querySelector('[name="side"]')?.value||"bilateral",
      load:round(Number(row.querySelector('[name="load"]')?.value||0),1),
      load_unit:row.querySelector('[name="load_unit"]')?.value||"kg",
      effort_type:row.querySelector('[name="effort_type"]')?.value||"dynamic",
      sets:clampNumber(row.querySelector('[name="sets"]')?.value,1,20,3),
      reps:clampNumber(row.querySelector('[name="reps"]')?.value,0,50,5),
      duration_seconds:clampNumber(row.querySelector('[name="duration_seconds"]')?.value,0,600,0),
      rpe:round(clampNumber(row.querySelector('[name="rpe"]')?.value,0,10,8),1),
      pain_during:round(clampNumber(row.querySelector('[name="pain_during"]')?.value,0,10,2),1),
      vector_quality:.88,
      technique_quality:.88,
      confirmed_rm:!1,
      notes:"captured"
    }))
  }
  function setSessionCaptureVisible(isVisible){
    state.sessionCaptureVisible=Boolean(isVisible);
    document.querySelectorAll("[data-session-capture]").forEach((panel)=>{
      panel.classList.toggle("panel-collapsed",!state.sessionCaptureVisible)
    })
  }
  function setCurrentScreen(screen){
    state.currentScreen=screen;
    elements.mainScreen.classList.toggle("screen-hidden",screen!=="main");
    elements.mainScreen.classList.toggle("screen-active",screen==="main");
    elements.performanceScreen.classList.toggle("screen-hidden",screen!=="performance");
    elements.performanceScreen.classList.toggle("screen-active",screen==="performance")
  }
  function navigateToPanel(screen,panel,focusElement){
    setCurrentScreen(screen);
    if(panel){panel.scrollIntoView({behavior:"smooth",block:"start"})}
    if(focusElement){setTimeout(()=>focusElement.focus(),150)}
  }
  function fillCheckinForm(latestCheckin){
    const current=latestCheckin||{};
    elements.checkinDate.value=current.date||todayText();
    elements.checkinBodyweight.value=current.bodyweight??DEFAULT_CHECKIN_VALUES.bodyweight;
    elements.checkinSleep.value=current.sleep_hours??DEFAULT_CHECKIN_VALUES.sleep_hours;
    elements.checkinReadiness.value=current.readiness??DEFAULT_CHECKIN_VALUES.readiness;
    elements.checkinTime.value=current.available_time_min??DEFAULT_CHECKIN_VALUES.available_time_min;
    elements.checkinPlanned.value=current.session_type_planned||DEFAULT_CHECKIN_VALUES.session_type_planned;
    elements.checkinMedialPain.value=current?.pain?.medial_elbow_right??DEFAULT_CHECKIN_VALUES.medial_elbow_right;
    elements.checkinGlobalFatigue.value=current?.fatigue?.global??DEFAULT_CHECKIN_VALUES.global_fatigue;
    elements.checkinForearmFatigue.value=current?.fatigue?.forearm_hand??DEFAULT_CHECKIN_VALUES.forearm_hand_fatigue;
    elements.checkinBackFatigue.value=current?.fatigue?.back??DEFAULT_CHECKIN_VALUES.back_fatigue;
    elements.checkinLegsFatigue.value=current?.fatigue?.legs??DEFAULT_CHECKIN_VALUES.legs_fatigue
  }
  function fillSessionForm(){
    elements.sessionDate.value=todayText();
    elements.sessionType.value=DEFAULT_SESSION_VALUES.session_type;
    elements.sessionGoal.value=DEFAULT_SESSION_VALUES.goal_of_session;
    elements.sessionRpe.value=DEFAULT_SESSION_VALUES.effort_rpe_session;
    elements.sessionBestPattern.value=DEFAULT_SESSION_VALUES.best_pattern;
    elements.sessionBestGrip.value=DEFAULT_SESSION_VALUES.best_grip_condition;
    elements.sessionMainLimitation.value=DEFAULT_SESSION_VALUES.main_limitation;
    elements.sessionMedialPain.value=DEFAULT_SESSION_VALUES.medial_pain;
    elements.sessionCouldStop.checked=DEFAULT_SESSION_VALUES.could_stop;
    elements.sessionCouldMove.checked=DEFAULT_SESSION_VALUES.could_move;
    elements.sessionCouldFinish.checked=DEFAULT_SESSION_VALUES.could_finish;
    elements.exerciseRows.innerHTML=DEFAULT_EXERCISE_TEMPLATES.map(buildExerciseRowHtml).join("")
  }
  function buildFriendlyInitError(error){
    return `No fue posible iniciar la app: ${error.message||error}`
  }
  function renderProfileSummary(container,athleteProfile){
    container.innerHTML=`
      <article class="stat-block">
        <h3>${escapeHtml(athleteProfile?.name||"Atleta")}</h3>
        <p class="muted">Objetivo dominante: ${escapeHtml(athleteProfile?.dominantGoal||"Sin dato")}</p>
        <p class="muted">Objetivo secundario: ${escapeHtml(athleteProfile?.secondaryGoal||"Sin dato")}</p>
      </article>
    `
  }
  function renderContextSummary(container,context,extras={}){
    const latestSession=getLatestSession(state.data);
    container.innerHTML=`
      <article class="stat-block">
        <h3>Especifico AW</h3>
        <div class="stat-grid stat-grid-2">
          <div><span class="muted">Dia</span><strong>${escapeHtml(latestSession?.date||"Sin dato")}</strong></div>
          <div><span class="muted">Ejercicios</span><strong>${escapeHtml((state.data?.exerciseEntries||[]).length)}</strong></div>
          <div><span class="muted">Intensidad</span><strong>${escapeHtml(latestSession?.effort_rpe_session?`Alta | RPE ${latestSession.effort_rpe_session}`:"Sin dato")}</strong></div>
          <div><span class="muted">Continuidad</span><strong>${escapeHtml(context?.continuityConfidence?formatDecimal(context.continuityConfidence,2):"Sin dato")}</strong></div>
        </div>
      </article>
    `
  }
  function renderUnavailableState(message){
    const note=`<div class="empty-note">${escapeHtml(message)}</div>`;
    if(elements.profileSummary){elements.profileSummary.innerHTML=note}
    if(elements.contextSummary){elements.contextSummary.innerHTML=note}
    if(elements.recommendationShell){elements.recommendationShell.innerHTML=note}
    if(elements.scoringShell){elements.scoringShell.innerHTML=""}
    if(elements.performanceGoals){elements.performanceGoals.innerHTML=note}
    if(elements.performanceData){elements.performanceData.innerHTML=note}
    if(elements.exerciseRecords){elements.exerciseRecords.innerHTML=note}
  }
  function renderPerformanceGoals(container,snapshot){
    container.innerHTML=`
      <article class="stat-block">
        <h3>${escapeHtml(snapshot?.title||"Atleta")}</h3>
        <p class="muted">${escapeHtml(snapshot?.subtitle||"Sin objetivo")}</p>
        <p class="muted">Foco actual: ${escapeHtml(snapshot?.focus||"Sin foco")}</p>
      </article>
    `
  }
  function renderPerformanceData(container,snapshot){
    container.innerHTML=`
      <div class="summary-grid">
        ${ensureArray(snapshot?.metrics).map((item)=>`
          <article class="stat-block">
            <h3>${escapeHtml(item.label)}</h3>
            <p class="muted">${escapeHtml(item.value)}</p>
          </article>
        `).join("")}
      </div>
    `
  }
  function renderExerciseRecords(container,records){
    if(!records?.length){
      container.innerHTML='<div class="empty-note">No hay records disponibles.</div>';
      return
    }
    container.innerHTML=records.map((record)=>`
      <article class="stat-block">
        <h3>${escapeHtml(formatUiText(record.exerciseName))} (${escapeHtml(formatUiText(record.side))})</h3>
        <p class="muted">Base actual: ${escapeHtml(record.recordLabel||"Sin dato")}</p>
        <p class="muted">Siguiente objetivo: ${escapeHtml(record.nextTargetLabel||"Sin dato")}</p>
      </article>
    `).join("")
  }
  function renderRecommendation(container, scoringContainer, recommendation) {
    const payload = recommendation?.session_recommendation;

    if (!payload) {
      container.innerHTML = '<div class="empty-note">No hay recomendación heurística disponible.</div>';
      scoringContainer.innerHTML = "";
      return;
    }

    container.innerHTML = `
    <article class="recommendation-card">
      <h3>${escapeHtml(payload.label || "Recomendación del día")}</h3>
      <div class="recommendation-meta">
        <p>${escapeHtml(payload.explanation || "Sin explicación disponible.")}</p>
        <div>
          <strong>Por que va primero</strong>
          <ul class="list">
            ${(Array.isArray(payload.reason) ? payload.reason : []).map((reason) => `<li>${escapeHtml(formatUiText(reason))}</li>`).join("")}
          </ul>
        </div>
      </div>
    </article>
  `;

    scoringContainer.innerHTML = `
    <article class="stat-block">
      <h3>Detalles</h3>
      <ul class="list">
        ${(Array.isArray(payload.priority_factors) ? payload.priority_factors : []).map((item) => `<li>${escapeHtml(formatUiText(item))}</li>`).join("")}
      </ul>
    </article>
  `;
  }
  function buildRouteBreakdownSummary(route) {
    const breakdown = route?.scoreBreakdown || {};
    const parts = [];
    if (breakdown.transferToTable !== void 0) {
      parts.push(`mesa ${formatDecimal(breakdown.transferToTable, 2)}`);
    }
    if (breakdown.offensiveImprovement !== void 0) {
      parts.push(`ofensiva ${formatDecimal(breakdown.offensiveImprovement, 2)}`);
    }
    if (breakdown.tissueSustainability !== void 0) {
      parts.push(`tejido ${formatDecimal(breakdown.tissueSustainability, 2)}`);
    }
    if (breakdown.continuityRobustness !== void 0) {
      parts.push(`robustez ${formatDecimal(breakdown.continuityRobustness, 2)}`);
    }
    return parts.join(" | ");
  }
  function buildRouteRoleLabel(role) {
    switch (role) {
      case "primary":
        return "Ruta Principal";
      case "alternative":
        return "Ruta Alternativa";
      case "contingency":
        return "Ruta De Contingencia";
      default:
        return "Ruta";
    }
  }
  function buildRouteCard(route, role) {
    if (!route) {
      return "";
    }
    const currentBlock = route?.route?.blocks?.[0] || null;
    const blockLabel = currentBlock?.blockLabel || "Sin bloque";
    const scenarioLabel = currentBlock?.scenarioLabel || "Sin escenario";
    const weakest = Array.isArray(route?.route?.predictedSummary?.weakestPredictedFactors) ? route.route.predictedSummary.weakestPredictedFactors.map((item) => formatUiText(item)).join(", ") : "Sin dato";
    return `
    <article class="stat-block">
      <div class="score-row-head">
        <h3>${escapeHtml(buildRouteRoleLabel(role))}</h3>
        <span class="pill ${role === "primary" ? "" : "pill-muted"}">Score ${escapeHtml(formatDecimal(route.totalScore, 2))}</span>
      </div>
      <p class="muted"><strong>${escapeHtml(route.label || route.routeId)}</strong></p>
      <p class="muted">Bloque actual: ${escapeHtml(blockLabel)} | Escenario: ${escapeHtml(scenarioLabel)}</p>
      <p class="muted">${escapeHtml(buildRouteBreakdownSummary(route))}</p>
      <p class="muted">Debilidades previstas: ${escapeHtml(weakest)}</p>
      <ul class="list">
        ${(route.reasons || []).slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
    </article>
  `;
}
  function renderAdaptiveRecommendation(container, scoringContainer, recommendation) {
    if (!recommendation) {
      container.innerHTML = '<div class="empty-note">No hay recomendacion adaptativa disponible todavia.</div>';
      scoringContainer.innerHTML = "";
      return;
    }

    const nextSession = recommendation.nextSessionRecommendation || {};
    const currentBlock = recommendation.currentBlockRecommendation || null;
    const ipp = recommendation.ipp || null;
    const ippVersion = recommendation.ippVersion || "IPP1";

    const renderAdaptiveExerciseList = (items = []) => {
      if (!Array.isArray(items) || items.length === 0) {
        return '<li>Sin ejercicios definidos.</li>';
      }

      return items.map((item) => {
        const exerciseName = formatUiText(item?.exerciseName || item?.exerciseKey || "ejercicio");
        const side = item?.side ? ` (${formatUiText(item.side)})` : "";
        const target = item?.target || "Sin objetivo";
        const why = item?.why ? ` | ${item.why}` : "";
        return `<li><strong>${escapeHtml(exerciseName)}${escapeHtml(side)}</strong>: ${escapeHtml(target)}${escapeHtml(why)}</li>`;
      }).join("");
    };

    const robustnessRaw = ipp?.robustnessScore ?? ipp?.robustness_score;
    const fragilityRaw = ipp?.setupFragility ?? ipp?.setup_fragility;
    const readinessRaw = ipp?.latentReadiness ?? ipp?.latent_readiness;
    const tissueRaw = ipp?.latentTissueIrritability ?? ipp?.latent_tissue_irritability;
    const posteriorRaw = ipp?.posteriorExpectedSuccess ?? ipp?.posterior_expected_success;

    const robustness = Number.isFinite(Number(robustnessRaw)) ? Number(robustnessRaw).toFixed(2) : "Sin dato";
    const fragility = Number.isFinite(Number(fragilityRaw)) ? Number(fragilityRaw).toFixed(3) : "Sin dato";
    const readiness = Number.isFinite(Number(readinessRaw)) ? Number(readinessRaw).toFixed(2) : "Sin dato";
    const tissue = Number.isFinite(Number(tissueRaw)) ? Number(tissueRaw).toFixed(2) : "Sin dato";
    const posterior = Number.isFinite(Number(posteriorRaw))
      ? `${(Number(posteriorRaw) <= 1 ? Number(posteriorRaw) * 100 : Number(posteriorRaw)).toFixed(1)}%`
      : "Sin dato";

    const ippSummaryMarkup = ipp
      ? `
        <div class="compact-stack">
          <strong>${escapeHtml(ippVersion)}</strong>
          <p class="muted">${escapeHtml(`Robustez ${robustness} | Fragilidad ${fragility} | Readiness ${readiness} | Tejido ${tissue} | Exito posterior ${posterior}`)}</p>
        </div>
      `
      : "";

    container.innerHTML = `
      <article class="recommendation-card">
        <h3>${escapeHtml(nextSession.sessionLabel || "Siguiente Sesion")}</h3>
        <div class="recommendation-meta">
          <p>${escapeHtml(currentBlock ? `Bloque actual: ${currentBlock.suggestedBlockLabel}.` : "Sin bloque actual definido.")}</p>
          ${ippSummaryMarkup}
          <div>
            <strong>Ejercicios Prioritarios</strong>
            <ul class="list">
              ${renderAdaptiveExerciseList(nextSession.primaryExercises)}
            </ul>
          </div>
          <div>
            <strong>Apoyo Del Dia</strong>
            <ul class="list">
              ${renderAdaptiveExerciseList(nextSession.supportiveExercises)}
            </ul>
          </div>
        </div>
      </article>
    `;

    const explanationText = Array.isArray(recommendation.explanation)
      ? recommendation.explanation.join(" ")
      : (Array.isArray(nextSession.rationale) ? nextSession.rationale.join(" ") : "");

    scoringContainer.innerHTML = `
      <article class="stat-block">
        <h3>Restricciones Y Logica</h3>
        <ul class="list">
          ${(nextSession.restrictions?.length > 0 ? nextSession.restrictions : ["Sin restriccion dominante."])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
        <div class="compact-stack">
          <p class="muted">${escapeHtml(explanationText)}</p>
        </div>
      </article>
      ${ipp ? `
      <article class="stat-block">
        <h3>Resumen ${escapeHtml(ippVersion)}</h3>
        <ul class="list">
          <li>${escapeHtml(`Robustez: ${robustness}`)}</li>
          <li>${escapeHtml(`Fragilidad setup: ${fragility}`)}</li>
          <li>${escapeHtml(`Readiness latente: ${readiness}`)}</li>
          <li>${escapeHtml(`Irritabilidad tisular: ${tissue}`)}</li>
          <li>${escapeHtml(`Exito posterior estimado: ${posterior}`)}</li>
        </ul>
      </article>
      ` : ""}
    `;
  }
  function renderSimulationRoutes(container, recommendation) {
    if (!recommendation) {
      container.innerHTML = '<div class="empty-note">Todavía no hay rutas simuladas disponibles.</div>';
      return;
    }
    const primary = recommendation.primaryRoute || null;
    const alternative = recommendation.alternativeRoute || null;
    const contingency = recommendation.contingencyRoute || null;
    container.innerHTML = `
    <div class="summary-grid">
      ${buildRouteCard(primary, "primary")}
      ${buildRouteCard(alternative, "alternative")}
    </div>
    <div class="summary-grid">
      ${buildRouteCard(contingency, "contingency")}
    </div>
  `;
  }
  function renderPostSessionInsight(container,insight){
    if(!insight){
      container.innerHTML='<div class="empty-note">Todavía no hay una sesión suficiente para leer qué funcionó y qué se debe priorizar después.</div>';
      return
    }
    container.innerHTML=`
    <article class="recommendation-card">
      <h3>${escapeHtml(insight.title)} - ${escapeHtml(insight.date)}</h3>
      <div class="recommendation-meta">
        <p>${escapeHtml(insight.overview)}</p>
        <div class="pill-row">
          <span class="pill pill-muted">sets ${escapeHtml(insight.metrics.totalSets)}</span>
          <span class="pill pill-muted">ejercicios ${escapeHtml(insight.metrics.exerciseCount)}</span>
          <span class="pill pill-muted">dolor medio ${escapeHtml(formatDecimal(insight.metrics.avgPain))}/10</span>
        </div>
      </div>
    </article>
  `
  }
  function renderWeeklyDashboard(container,weeklyDashboard){
    if(!weeklyDashboard){
      container.innerHTML='<div class="empty-note">Todavía no hay suficiente captura para leer la semana.</div>';
      return
    }
    container.innerHTML=`
      <article class="stat-block">
        <h3>${escapeHtml(weeklyDashboard.recommendedFocus)}</h3>
        <ul class="list">
          ${ensureArray(weeklyDashboard.riskFlags).map((item)=>`<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    `
  }
  async function saveCheckin(payload){
    if(isStrictMode()){
      return requestJson("/checkins",{method:"POST",body:JSON.stringify(payload)})
    }
    state.data.dailyCheckins=sortByDateDescending([payload,...state.data.dailyCheckins.filter((entry)=>entry.date!==payload.date)]);
    state.data.storage={source:"seed",lastSyncAt:new Date().toISOString()};
    persistLocalState(state.data);
    return {ok:true,data:state.data}
  }
  async function saveSession(payload){
    if(isStrictMode()){
      return requestJson("/sessions",{method:"POST",body:JSON.stringify(payload)})
    }
    state.data.sessions=sortByDateDescending([payload.session,...state.data.sessions]);
    state.data.exerciseEntries=sortByDateDescending([...payload.exerciseEntries,...state.data.exerciseEntries]);
    state.data.exerciseRecords=buildExerciseRecords(state.data.exerciseEntries);
    state.data.storage={source:"seed",lastSyncAt:new Date().toISOString()};
    persistLocalState(state.data);
    return {ok:true,data:state.data}
  }
  function handleStartSessionProgrammed(){
    setSessionCaptureVisible(true);
    navigateToPanel("main",elements.checkinPanel,elements.checkinDate)
  }
  function handleViewHistory(){
    setSessionCaptureVisible(false);
    navigateToPanel("main",elements.historyPanel)
  }
  function handleViewRecords(){
    setSessionCaptureVisible(false);
    navigateToPanel("performance",elements.recordsPanel||elements.performanceGoals)
  }
  async function hydrateStrictArtifacts(){
    if(state.meta?.mode!=="strict"||!state.meta?.strictAvailable){
      state.strictConfig=null;
      state.simulationCycle=null;
      state.ippCycle=null;
      return
    }
    const strictConfig=await loadStrictConfig();
    let simulationCycle=null;
    let ippCycle=null;
    try{simulationCycle=await loadSimulationCycle()}catch(error){console.warn("No fue posible cargar el ciclo de simulación desde el servidor. Se usará el fallback local.",error)}
    try{ippCycle=await loadIPPCycle()}catch(error){console.warn("No fue posible cargar IPP1 desde el servidor.",error)}
    state.strictConfig=strictConfig;
    state.simulationCycle=simulationCycle;
    state.ippCycle=ippCycle
  }
  function updateSyncStatusFromData(){
    if(state.initError){
      state.syncStatus=state.initError;
      return
    }
    if(window.location.protocol==="file:"){
      state.syncStatus="Usa .\\serve.ps1 para activar SQLite.";
      return
    }
    if(state.data?.storage?.source==="sqlite"){
      const syncTime=state.data?.storage?.lastSyncAt?new Date(state.data.storage.lastSyncAt).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}):null;
      const modeLabel=isStrictMode()?"Modo estricto":"Modo demo";
      const simulationLabel=isStrictMode()&&state.simulationCycle?" | ciclo adaptativo listo":"";
      const ippLabel=isStrictMode()&&state.ippCycle?" | IPP1 listo":"";
      state.syncStatus=`SQLite conectado${syncTime?` · ${syncTime}`:""} · ${modeLabel}${simulationLabel}${ippLabel}`;
      return
    }
    state.syncStatus="Usando seed/localStorage"
  }
  function renderApp() {
    const strictMode = isStrictMode();
    const strictPlan = getStrictPlan();
    const simulationCycle = strictMode ? state.simulationCycle : null;
    if (!state.data || !state.data.athleteProfile) {
      renderUnavailableState(state.initError || "No fue posible cargar datos desde SQLite.");
      if (elements.heroPainValue) {
        elements.heroPainValue.textContent = "Sin Dato";
      }
      if (elements.heroReadinessValue) {
        elements.heroReadinessValue.textContent = "Sin Dato";
      }
      if (elements.heroFocusValue) {
        elements.heroFocusValue.textContent = strictMode ? "Strict" : "Sin Foco";
      }
      if (elements.modeBadge) {
        elements.modeBadge.textContent = strictMode ? "Modo Estricto" : "Modo Demo";
      }
      if (elements.sourceBadge) {
        elements.sourceBadge.textContent = "Fuente No Disponible";
      }
      elements.statusLine.textContent = state.syncStatus;
      setSessionCaptureVisible(state.sessionCaptureVisible);
      setCurrentScreen(state.currentScreen);
      return;
    }
    const latestCheckin = getLatestCheckin(state.data);
    const latestSession = getLatestSession(state.data);
    const context = latestCheckin ? buildCurrentState(state.data.athleteProfile, state.data.sessions, latestCheckin, state.data.exerciseEntries) : null;
    const fallbackRealState = strictMode ? buildRealState({
      athleteProfile: state.data.athleteProfile,
      checkins: state.data.dailyCheckins,
      sessions: state.data.sessions,
      exerciseEntries: state.data.exerciseEntries,
      exerciseRecords: state.data.exerciseRecords,
      nowDate: latestCheckin?.date || latestSession?.date || todayText()
    }) : null;
    const realState = strictMode ? simulationCycle?.realState || fallbackRealState : null;
    const candidateRoutes = strictMode ? simulationCycle?.candidateRoutes || (realState ? buildCandidateRoutes({ realState, horizonWeeks: 24 }) : []) : [];
    const scoredRoutes = strictMode ? simulationCycle?.scoredRoutes || scoreRoutes(candidateRoutes) : [];
    const adaptiveRecommendation = strictMode ? simulationCycle?.recommendation || buildAdaptiveRecommendation({
      realState,
      strictSessionPlan: strictPlan,
      scoredRoutes
    }) : null;
    const heuristicRecommendation = !strictMode && latestCheckin ? recommendSession(state.data.athleteProfile, state.data.sessions, latestCheckin, state.data.exerciseEntries) : null;
    const recommendation = strictMode ? adaptiveRecommendation : heuristicRecommendation;
    const featuredSession = getFeaturedSession();
    const postSessionInsight = !strictMode && featuredSession ? buildSessionInsight(state.data.athleteProfile, featuredSession, state.data.exerciseEntries) : null;
    const weeklyDashboard = !strictMode ? buildWeeklyDashboard(
      state.data.athleteProfile,
      state.data.dailyCheckins,
      state.data.sessions,
      state.data.exerciseEntries,
      latestCheckin?.date || todayText()
    ) : null;
    const performanceSnapshot = strictMode ? buildAdaptivePerformanceSnapshot(
      state.data.athleteProfile,
      latestCheckin,
      latestSession,
      adaptiveRecommendation,
      realState,
      state.data.exerciseRecords
    ) : buildPerformanceSnapshot(
      state.data.athleteProfile,
      latestCheckin,
      context,
      recommendation,
      weeklyDashboard,
      postSessionInsight,
      state.data.exerciseEntries,
      state.data.exerciseRecords
    );
    renderProfileSummary(elements.profileSummary, state.data.athleteProfile);
    renderContextSummary(elements.contextSummary, context, {
      sessions: state.data.sessions,
      exerciseEntries: state.data.exerciseEntries
    });

    const adaptivePayload =
      adaptiveRecommendation ||
      simulationCycle?.recommendation ||
      null;

    const hasAdaptiveRecommendation = Boolean(
      adaptivePayload?.nextSessionRecommendation
    );

if (hasAdaptiveRecommendation) {
  safeRender(() => {
    renderAdaptiveRecommendation(
      elements.recommendationShell,
      elements.scoringShell,
      adaptivePayload
    );
    return true;
  }) || (elements.recommendationShell.innerHTML = '<div class="empty-note">No fue posible renderizar la recomendación adaptativa.</div>');
} else {
  safeRender(() => {
    renderRecommendation(
      elements.recommendationShell,
      elements.scoringShell,
      recommendation
    );
    return true;
  }) || (elements.recommendationShell.innerHTML = '<div class="empty-note">No fue posible renderizar la recomendación.</div>');
}

    if (elements.postSessionShell) {
      renderPostSessionInsight(elements.postSessionShell, postSessionInsight);
    }
    if (elements.weeklyDashboard) {
      renderWeeklyDashboard(elements.weeklyDashboard, weeklyDashboard);
    }
    if (elements.sessionHistory) {
      if (strictMode) {
        elements.sessionHistory.innerHTML = "";
      } else {
        renderSessionHistory(elements.sessionHistory, state.data.sessions, state.data.exerciseEntries);
      }
    }
    if (elements.simulationRoutes) {
  safeRender(() => {
    renderSimulationRoutes(elements.simulationRoutes, adaptiveRecommendation);
    return true;
  }) || (elements.simulationRoutes.innerHTML = '<div class="empty-note">No fue posible renderizar las rutas simuladas.</div>');
}
    renderPerformanceGoals(elements.performanceGoals, performanceSnapshot);
    renderPerformanceData(elements.performanceData, performanceSnapshot);
    renderExerciseRecords(elements.exerciseRecords, performanceSnapshot.records);
    if (elements.heroPainValue) {
      elements.heroPainValue.textContent = context ? `${context.medialPainToday}/10` : "Sin Dato";
    }
    if (elements.heroReadinessValue) {
      elements.heroReadinessValue.textContent = context ? `${context.readiness}/10` : "Sin Dato";
    }
    if (elements.heroFocusValue) {
      elements.heroFocusValue.textContent = strictMode ? adaptiveRecommendation?.currentBlockRecommendation?.suggestedBlockLabel || adaptiveRecommendation?.nextSessionRecommendation?.sessionLabel || "Sin Foco" : recommendation?.session_recommendation?.label || "Sin Foco";
    }
    if (elements.modeBadge) {
      elements.modeBadge.textContent = strictMode ? "Modo Estricto" : "Modo Demo";
    }
    if (elements.sourceBadge) {
      const source = state.data?.storage?.source === "seed" ? "Fuente Seed" : "Fuente SQLite";
      elements.sourceBadge.textContent = source;
    }
    elements.statusLine.textContent = state.syncStatus;
    setSessionCaptureVisible(state.sessionCaptureVisible);
    setCurrentScreen(state.currentScreen);
  }
  async function hydrateData(){
    state.meta=await loadServerMeta();
    state.data=await loadAppData(state.meta);
    state.data.exerciseRecords=buildExerciseRecords(state.data.exerciseEntries);
    await hydrateStrictArtifacts();
    state.initError="";
    updateSyncStatusFromData()
  }
  async function handleCheckinSubmit(event){
    event.preventDefault();
    const payload=normalizeCheckinFormData(new FormData(elements.checkinForm));
    try{
      await saveCheckin(payload);
      state.data.exerciseRecords=buildExerciseRecords(state.data.exerciseEntries);
      state.syncStatus="Check-in guardado";
      updateSyncStatusFromData();
      renderApp()
    }catch(error){
      state.syncStatus=`Error al guardar check-in: ${error.message}`;
      renderApp()
    }
  }
  async function handleSessionSubmit(event){
    event.preventDefault();
    const session=normalizeSessionFormData(new FormData(elements.sessionForm));
    state.pendingSessionId=session.session_id;
    const exerciseEntries=parseExerciseRows().map((entry,index)=>_objectSpread2(_objectSpread2({},entry),{entry_id:`${session.session_id}-ex-${String(index+1).padStart(2,"0")}`,session_id:session.session_id,date:session.date}));
    session.exercise_entry_count=exerciseEntries.length;
    const payload={session,exerciseEntries};
    try{
      await saveSession(payload);
      state.data.exerciseRecords=buildExerciseRecords(state.data.exerciseEntries);
      state.syncStatus="Sesion guardada";
      updateSyncStatusFromData();
      renderApp()
    }catch(error){
      state.syncStatus=`Error al guardar sesion: ${error.message}`;
      renderApp()
    }
  }
  function addExerciseRow(template={}){
    const wrapper=document.createElement("div");
    wrapper.innerHTML=buildExerciseRowHtml(template,elements.exerciseRows.children.length);
    elements.exerciseRows.appendChild(wrapper.firstElementChild)
  }
  function bindEventListeners(){
    elements.checkinForm.addEventListener("submit",handleCheckinSubmit);
    elements.sessionForm.addEventListener("submit",handleSessionSubmit);
    elements.addExerciseRow.addEventListener("click",()=>addExerciseRow());
    elements.startSessionButton.addEventListener("click",handleStartSessionProgrammed);
    elements.viewHistoryButton.addEventListener("click",handleViewHistory);
    elements.viewRecordsButton.addEventListener("click",handleViewRecords);
    elements.recommendButton.addEventListener("click",()=>{
      renderApp();
      elements.recommendationShell.scrollIntoView({behavior:"smooth",block:"start"})
    })
  }
  const elements={
    mainScreen:document.getElementById("main-screen"),
    performanceScreen:document.getElementById("performance-screen"),
    profileSummary:document.getElementById("profile-summary"),
    contextSummary:document.getElementById("context-summary"),
    recommendationShell:document.getElementById("recommendation-shell"),
    scoringShell:document.getElementById("scoring-shell"),
    performanceGoals:document.getElementById("performance-goals"),
    performanceData:document.getElementById("performance-data"),
    exerciseRecords:document.getElementById("exercise-records"),
    checkinForm:document.getElementById("checkin-form"),
    sessionForm:document.getElementById("session-form"),
    checkinPanel:document.getElementById("checkin-panel"),
    historyPanel:document.getElementById("history-panel"),
    recordsPanel:document.getElementById("records-panel"),
    checkinDate:document.getElementById("checkin-date"),
    checkinBodyweight:document.getElementById("checkin-bodyweight"),
    checkinSleep:document.getElementById("checkin-sleep"),
    checkinReadiness:document.getElementById("checkin-readiness"),
    checkinTime:document.getElementById("checkin-time"),
    checkinPlanned:document.getElementById("checkin-planned"),
    checkinMedialPain:document.getElementById("checkin-medial-pain"),
    checkinGlobalFatigue:document.getElementById("checkin-global-fatigue"),
    checkinForearmFatigue:document.getElementById("checkin-forearm-fatigue"),
    checkinBackFatigue:document.getElementById("checkin-back-fatigue"),
    checkinLegsFatigue:document.getElementById("checkin-legs-fatigue"),
    sessionDate:document.getElementById("session-date"),
    sessionType:document.getElementById("session-type"),
    sessionGoal:document.getElementById("session-goal"),
    sessionRpe:document.getElementById("session-rpe"),
    sessionBestPattern:document.getElementById("session-best-pattern"),
    sessionBestGrip:document.getElementById("session-best-grip"),
    sessionMainLimitation:document.getElementById("session-main-limitation"),
    sessionMedialPain:document.getElementById("session-medial-pain"),
    sessionCouldStop:document.getElementById("session-could-stop"),
    sessionCouldMove:document.getElementById("session-could-move"),
    sessionCouldFinish:document.getElementById("session-could-finish"),
    exerciseRows:document.getElementById("exercise-rows"),
    addExerciseRow:document.getElementById("add-exercise-row"),
    startSessionButton:document.getElementById("start-session-button"),
    viewHistoryButton:document.getElementById("view-history-button"),
    viewRecordsButton:document.getElementById("view-records-button"),
    recommendButton:document.getElementById("recommend-button"),
    heroPainValue:document.getElementById("hero-pain-value"),
    heroReadinessValue:document.getElementById("hero-readiness-value"),
    heroFocusValue:document.getElementById("hero-focus-value"),
    statusLine:document.getElementById("status-line"),
    modeBadge:document.getElementById("mode-badge"),
    sourceBadge:document.getElementById("source-badge"),
    sessionHistory:document.getElementById("session-history"),
    postSessionShell:document.getElementById("post-session-shell"),
    weeklyDashboard:document.getElementById("weekly-dashboard"),
    simulationRoutes:document.getElementById("simulation-routes")
  };
  const state={
    meta:{mode:"demo",strictAvailable:false},
    data:loadLocalState(),
    strictConfig:null,
    simulationCycle:null,
    ippCycle:null,
    initError:"",
    syncStatus:"Conectando...",
    sessionCaptureVisible:false,
    currentScreen:"main",
    pendingSessionId:null,
    lastRecommendationLabel:"sin recomendacion"
  };
  async function init(){
    fillCheckinForm(getLatestCheckin(state.data));
    fillSessionForm();
    bindEventListeners();
    try{
      await hydrateData();
      fillCheckinForm(getLatestCheckin(state.data))
    }catch(error){
      console.error("No fue posible iniciar la app.",error);
      state.meta=state.meta||{mode:"strict",strictAvailable:false};
      state.initError=buildFriendlyInitError(error);
      state.syncStatus=state.initError
    }
    renderApp()
  }
  init()
})();