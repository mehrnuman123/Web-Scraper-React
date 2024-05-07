import { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { TextField, Box, Typography, Autocomplete, Button, Alert } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/LeadsDataTable";
import mapsBusinessList from "./data/mapsBusinessList";
import Snackbar from '@mui/material/Snackbar';
import typography from "assets/theme/base/typography";
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 function from uuid library
import Progress from "./data/ProgressBar";
import Icon from "@mui/material/Icon";
import MDButton from "components/MDButton";



function Finder() {
  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();
  const [leadSearchOptions, setLeadSearchOptions] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [progress, setProgress] = useState(null);
  const [leadSearchInputValue, setLeadSearchInputValue] = useState('')
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [queryContainer, setQueryContainer] = useState(null)
  const [catchedResponse, setCatchedResponse] = useState([])
  const [requests, setRequests] = useState([])
  const { size } = typography;
  const apiUrl = process.env.REACT_APP_NODE_API;

  const [leads, setLeads] = useState([]);
  const [findAction, setFindAction] = useState(false)



  // const handleFind = async (e) => {
  //   try {
  //     e.preventDefault();
  //     setLoading(true);
  //     setFindAction(true)
  //     setProgress(0);
  //     const data = {
  //       search: leadSearchOptions ?? leadSearchInputValue,
  //       city: selectedCity,
  //       country: selectedCountry
  //     };
  //     setQueryContainer(data)
  //     setLeadSearchOptions('')
  //     setLeadSearchInputValue('')
  //     setSelectedCity('')
  //     setSelectedCountry('')
  //     setOpenSnackBar(true)
  //     const url = `${apiUrl}/leads`
  //     const response = await axios.post(url, queryContainer);

  //     let percentage = 0;
  //     const interval = setInterval(() => {
  //       percentage += 10; // Increase progress by 10% with each interval
  //       setProgress(percentage);
  //       if (percentage >= 100) {
  //         clearInterval(interval);
  //         setLoading(false);
  //       }
  //     }, 1000); // Adjust the timeout interval as needed

  //     if (response && response.data && response.data.data) {
  //       const leadObj = {
  //         id: String(Math.random()),
  //         name: response.data.data.general.query,
  //         progres: progress,
  //         leads: response.data.data.organic.length,
  //         date: response.data.data.searched_at,
  //         leadsData: response.data.data.organic
  //       }
  //       setLeads(leadObj);
  //     }
  //   } catch (err) {
  //     setFindAction(false);
  //     setLoading(false);
  //     console.error('Error:', err);
  //     // Handle error: display error message to user
  //   }
  // }

  useEffect(() => {
    if (progress && findAction === true) {
      leads.progres = progress;
    }

  }, [findAction, leads, progress])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,altSpellings');
        if (response) {
          const countryArr = []
          await response?.data?.map(cntry => {
            const obj = { label: `${cntry?.name?.common}, (${cntry?.altSpellings[0]})`, value: cntry?.altSpellings[0] };
            countryArr.push(obj);
            return obj; // Return the object here
          });

          setCountries(countryArr)
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCloseSnackBar = () => {
    setOpenSnackBar(false)
  }

  const handleSearchInputChange = (e) => {
    const lowercaseStr = e.target.value?.toLowerCase();
    setLeadSearchInputValue(lowercaseStr);
  }


  const handleCountryChange = (event, option) => {
    const lowercaseStr = option?.value?.toLowerCase();
    setSelectedCountry(lowercaseStr);
  };

  const handleSearchOptionChange = (event, value) => {
    const lowercaseStr = value?.toLowerCase();
    setLeadSearchOptions(lowercaseStr);
  };

  const fetchData = async () => {
    setLoading(true);
    setStartTime(new Date());
    setOpenSnackBar(true)
    setQueryContainer(null)
    const requestId = uuidv4();
    const currentTime = `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    const newRequest = {
      name: leadSearchOptions || leadSearchInputValue,
      progress: (<Progress color="info" value={0} />),
      date: currentTime,
      leads: '-',
      action: (
        <MDTypography component="a" href="#" color="text">
          <Icon>more_vert</Icon>
        </MDTypography>
      ),
      leadsData: [],
      requestId: requestId,
    };
    setLeads(prevData => [...prevData, newRequest]);
    try {
      const queryData = {
        search: leadSearchInputValue || leadSearchOptions,
        city: selectedCity,
        country: selectedCountry,
        requestId: requestId
      };

      // setQueryContainer(queryData)
      // setLeadSearchOptions('')
      // setLeadSearchInputValue('')
      // setSelectedCity('')
      // setSelectedCountry('')
      // const timeoutDuration = 120000; // 2 minutes timeout
      // const timeoutPromise = new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     reject(new Error('API call timed out'));
      //   }, timeoutDuration);
      // });

      const response = await Promise.race([
        axios.post(`${apiUrl}/leads`, queryData)]);
      if (response.data?.data) {
        setCatchedResponse(response.data?.data)
      }
      // console.log(response.data);
      // newRequest.leadsData = response.data;
      // newRequest.leads = response.data?.organic?.length
      // console.log(newRequest, 'after response');
      // setLeads([newRequest]);
    } catch (error) {
      setError(error);
    } finally {
      setEndTime(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    if (catchedResponse && leads) {
      setLeads(prevLeads => {
        const updatedLeads = prevLeads.map(lead => {
          if (lead.requestId === catchedResponse.requestId) {
            return {
              ...lead,
              progress: (<Progress color="success" value={100} />),
              leadsData: catchedResponse.organic,
              leads: catchedResponse.organic?.length || '0'
            };
          }
          return lead;
        });
        return updatedLeads;
      });
    }
  }, [leads, catchedResponse]);
  




  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={12}>
          <Grid item xs={12}>
            <Card>
              <Grid item xs={12} sm={12} md={6}>
                <Box
                  display="flex"
                  flexDirection='column'
                  alignItems="center"
                  gap={4}
                  p={2}
                  mt='1rem'
                  height='50%'
                  width='100%'
                >
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start' }}>
                    <MDBox
                      display="flex"
                      justifyContent="start"
                      alignItems="center"
                      flexWrap="wrap"
                      color="text"
                      fontSize={size.md}
                    >
                      Finder</MDBox>
                    <MDTypography variant="button" color="text">
                      Search for leads by City and Country.
                    </MDTypography>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <MDBox
                      display="flex"
                      justifyContent="start"
                      alignItems="center"
                      flexWrap="wrap"
                      color="text"
                      fontSize={size.sm}
                      mb='0.5rem'
                    >
                      Find</MDBox>
                    <Autocomplete
                      id="free-solo-demo"
                      freeSolo
                      fullWidth
                      options={mapsBusinessList.map((option) => option)}
                      onChange={handleSearchOptionChange}
                      renderInput={(params) => <TextField {...params} placeholder="Hotel" onChange={handleSearchInputChange} />}
                    />
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <MDBox
                      display="flex"
                      justifyContent="start"
                      alignItems="center"
                      flexWrap="wrap"
                      color="text"
                      fontSize={size.sm}
                      mb='0.5rem'
                    >
                      City</MDBox>
                    <TextField fullWidth type='text' sx={{
                      '& input': {
                        height: '2rem'
                      }
                    }} value={selectedCity}
                      placeholder='Dubai' onChange={(e) => setSelectedCity(e.target.value)} />
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <MDBox
                      display="flex"
                      justifyContent="start"
                      alignItems="center"
                      flexWrap="wrap"
                      color="text"
                      fontSize={size.sm}
                      mb='0.5rem'
                    >
                      Country</MDBox>
                    <Autocomplete
                      id="country-select-demo"
                      sx={{ width: '100%' }}
                      options={countries}
                      fullWidth
                      autoHighlight
                      onChange={handleCountryChange}
                      getOptionLabel={(option) => option.label}
                      renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                          <img
                            loading="lazy"
                            width="20"
                            srcSet={`https://flagcdn.com/w40/${option.value.toLowerCase()}.png 2x`}
                            src={`https://flagcdn.com/w20/${option.value.toLowerCase()}.png`}
                            alt=""
                          />
                          {option.label}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Choose a country"
                          fullWidth
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: 'new-password', // disable autocomplete and autofill
                          }}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                    {/* disabled={(leadSearchInputValue === undefined && leadSearchOptions === undefined) || !selectedCity || !selectedCountry} */}
                    <MDButton variant="contained" color='info' type='submit' onClick={fetchData}>Find</MDButton>
                  </Box>
                </Box>
              </Grid>
              <Box sx={{ height: '100%', width: '50%' }}>
              </Box>
              <Snackbar open={openSnackBar} autoHideDuration={6000} onClose={handleCloseSnackBar}>
                <Alert
                  onClose={handleCloseSnackBar}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  severity="info"
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  Generating your leads...
                </Alert>
              </Snackbar>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Leads
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: pColumns, rows: leads }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Finder;
