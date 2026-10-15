/**
 * Bangladesh divisions → districts → areas (upazilas, plus City Corporation thanas for Dhaka and Chattogram).
 * Generated from https://github.com/nuhil/bangladesh-geocode with modern spellings applied.
 */
export interface BdDistrict {
  name: string;
  areas: string[];
}
export interface BdDivision {
  name: string;
  districts: BdDistrict[];
}

export const BD_LOCATIONS: BdDivision[] = [
  {
    name: "Barishal",
    districts: [
      {
        name: "Barguna",
        areas: [
          "Amtali",
          "Bamna",
          "Barguna Sadar",
          "Betagi",
          "Pathorghata",
          "Taltali"
        ]
      },
      {
        name: "Barishal",
        areas: [
          "Agailjhara",
          "Babuganj",
          "Bakerganj",
          "Banaripara",
          "Barisal Sadar",
          "Gournadi",
          "Hizla",
          "Mehendiganj",
          "Muladi",
          "Wazirpur"
        ]
      },
      {
        name: "Bhola",
        areas: [
          "Bhola Sadar",
          "Borhan Sddin",
          "Charfesson",
          "Doulatkhan",
          "Lalmohan",
          "Monpura",
          "Tazumuddin"
        ]
      },
      {
        name: "Jhalakathi",
        areas: [
          "Jhalakathi Sadar",
          "Kathalia",
          "Nalchity",
          "Rajapur"
        ]
      },
      {
        name: "Patuakhali",
        areas: [
          "Bauphal",
          "Dashmina",
          "Dumki",
          "Galachipa",
          "Kalapara",
          "Mirzaganj",
          "Patuakhali Sadar",
          "Rangabali"
        ]
      },
      {
        name: "Pirojpur",
        areas: [
          "Bhandaria",
          "Kawkhali",
          "Mathbaria",
          "Nazirpur",
          "Nesarabad",
          "Pirojpur Sadar",
          "Zianagar"
        ]
      }
    ]
  },
  {
    name: "Chattogram",
    districts: [
      {
        name: "Bandarban",
        areas: [
          "Alikadam",
          "Bandarban Sadar",
          "Lama",
          "Naikhongchhari",
          "Rowangchhari",
          "Ruma",
          "Thanchi"
        ]
      },
      {
        name: "Brahmanbaria",
        areas: [
          "Akhaura",
          "Ashuganj",
          "Bancharampur",
          "Bijoynagar",
          "Brahmanbaria Sadar",
          "Kasba",
          "Nabinagar",
          "Nasirnagar",
          "Sarail"
        ]
      },
      {
        name: "Chandpur",
        areas: [
          "Chandpur Sadar",
          "Faridgonj",
          "Haimchar",
          "Hajiganj",
          "Kachua",
          "Matlab North",
          "Matlab South",
          "Shahrasti"
        ]
      },
      {
        name: "Chattogram",
        areas: [
          "Akbar Shah",
          "Anwara",
          "Bakalia",
          "Bandar",
          "Banshkhali",
          "Bayazid Bostami",
          "Boalkhali",
          "Chandanaish",
          "Chandgaon",
          "Chawkbazar",
          "Double Mooring",
          "EPZ",
          "Fatikchhari",
          "Halishahar",
          "Hathazari",
          "Karnafuli",
          "Karnaphuli",
          "Khulshi",
          "Kotwali",
          "Lohagara",
          "Mirsharai",
          "Pahartali",
          "Panchlaish",
          "Patenga",
          "Patiya",
          "Rangunia",
          "Raozan",
          "Sadarghat",
          "Sandwip",
          "Satkania",
          "Sitakunda"
        ]
      },
      {
        name: "Cox's Bazar",
        areas: [
          "Chakaria",
          "Cox's Bazar Sadar",
          "Eidgaon",
          "Kutubdia",
          "Moheshkhali",
          "Pekua",
          "Ramu",
          "Teknaf",
          "Ukhiya"
        ]
      },
      {
        name: "Cumilla",
        areas: [
          "Barura",
          "Brahmanpara",
          "Burichang",
          "Chandina",
          "Chauddagram",
          "Comilla Sadar",
          "Daudkandi",
          "Debidwar",
          "Homna",
          "Laksam",
          "Lalmai",
          "Meghna",
          "Monohargonj",
          "Muradnagar",
          "Nangalkot",
          "Sadarsouth",
          "Titas"
        ]
      },
      {
        name: "Feni",
        areas: [
          "Chhagalnaiya",
          "Daganbhuiyan",
          "Feni Sadar",
          "Fulgazi",
          "Parshuram",
          "Sonagazi"
        ]
      },
      {
        name: "Khagrachhari",
        areas: [
          "Dighinala",
          "Guimara",
          "Khagrachhari Sadar",
          "Laxmichhari",
          "Manikchari",
          "Matiranga",
          "Mohalchari",
          "Panchari",
          "Ramgarh"
        ]
      },
      {
        name: "Lakshmipur",
        areas: [
          "Kamalnagar",
          "Lakshmipur Sadar",
          "Raipur",
          "Ramganj",
          "Ramgati"
        ]
      },
      {
        name: "Noakhali",
        areas: [
          "Begumganj",
          "Chatkhil",
          "Companiganj",
          "Hatia",
          "Kabirhat",
          "Noakhali Sadar",
          "Senbug",
          "Sonaimori",
          "Subarnachar"
        ]
      },
      {
        name: "Rangamati",
        areas: [
          "Baghaichari",
          "Barkal",
          "Belaichari",
          "Juraichari",
          "Kaptai",
          "Kawkhali",
          "Langadu",
          "Naniarchar",
          "Rajasthali",
          "Rangamati Sadar"
        ]
      }
    ]
  },
  {
    name: "Dhaka",
    districts: [
      {
        name: "Dhaka",
        areas: [
          "Adabor",
          "Badda",
          "Banani",
          "Bangshal",
          "Bhashantek",
          "Bhatara",
          "Biman Bandar",
          "Cantonment",
          "Chawkbazar",
          "Dakshinkhan",
          "Darus Salam",
          "Demra",
          "Dhamrai",
          "Dhanmondi",
          "Dohar",
          "Gendaria",
          "Gulshan",
          "Hatirjheel",
          "Hazaribagh",
          "Jatrabari",
          "Kadamtali",
          "Kafrul",
          "Kalabagan",
          "Kamrangirchar",
          "Keraniganj",
          "Khilgaon",
          "Khilkhet",
          "Kotwali",
          "Lalbagh",
          "Mirpur",
          "Mohammadpur",
          "Motijheel",
          "Mugda",
          "Nawabganj",
          "New Market",
          "Pallabi",
          "Paltan",
          "Ramna",
          "Rampura",
          "Rupnagar",
          "Sabujbagh",
          "Savar",
          "Shah Ali",
          "Shahbagh",
          "Shahjahanpur",
          "Sher-e-Bangla Nagar",
          "Shyampur",
          "Sutrapur",
          "Tejgaon",
          "Tejgaon Industrial Area",
          "Turag",
          "Uttara East",
          "Uttara West",
          "Uttarkhan",
          "Vatara",
          "Wari"
        ]
      },
      {
        name: "Faridpur",
        areas: [
          "Alfadanga",
          "Bhanga",
          "Boalmari",
          "Charbhadrasan",
          "Faridpur Sadar",
          "Madhukhali",
          "Nagarkanda",
          "Sadarpur",
          "Saltha"
        ]
      },
      {
        name: "Gazipur",
        areas: [
          "Gazipur Sadar",
          "Kaliakair",
          "Kaliganj",
          "Kapasia",
          "Sreepur"
        ]
      },
      {
        name: "Gopalganj",
        areas: [
          "Gopalganj Sadar",
          "Kashiani",
          "Kotalipara",
          "Muksudpur",
          "Tungipara"
        ]
      },
      {
        name: "Kishoreganj",
        areas: [
          "Austagram",
          "Bajitpur",
          "Bhairab",
          "Hossainpur",
          "Itna",
          "Karimgonj",
          "Katiadi",
          "Kishoreganj Sadar",
          "Kuliarchar",
          "Mithamoin",
          "Nikli",
          "Pakundia",
          "Tarail"
        ]
      },
      {
        name: "Madaripur",
        areas: [
          "Dasar",
          "Kalkini",
          "Madaripur Sadar",
          "Rajoir",
          "Shibchar"
        ]
      },
      {
        name: "Manikganj",
        areas: [
          "Doulatpur",
          "Gior",
          "Harirampur",
          "Manikganj Sadar",
          "Saturia",
          "Shibaloy",
          "Singiar"
        ]
      },
      {
        name: "Munshiganj",
        areas: [
          "Gajaria",
          "Louhajanj",
          "Munshiganj Sadar",
          "Sirajdikhan",
          "Sreenagar",
          "Tongibari"
        ]
      },
      {
        name: "Narayanganj",
        areas: [
          "Araihazar",
          "Bandar",
          "Narayanganj Sadar",
          "Rupganj",
          "Sonargaon"
        ]
      },
      {
        name: "Narsingdi",
        areas: [
          "Belabo",
          "Monohardi",
          "Narsingdi Sadar",
          "Palash",
          "Raipura",
          "Shibpur"
        ]
      },
      {
        name: "Rajbari",
        areas: [
          "Baliakandi",
          "Goalanda",
          "Kalukhali",
          "Pangsa",
          "Rajbari Sadar"
        ]
      },
      {
        name: "Shariatpur",
        areas: [
          "Bhedarganj",
          "Damudya",
          "Gosairhat",
          "Naria",
          "Shariatpur Sadar",
          "Zajira"
        ]
      },
      {
        name: "Tangail",
        areas: [
          "Basail",
          "Bhuapur",
          "Delduar",
          "Dhanbari",
          "Ghatail",
          "Gopalpur",
          "Kalihati",
          "Madhupur",
          "Mirzapur",
          "Nagarpur",
          "Sakhipur",
          "Tangail Sadar"
        ]
      }
    ]
  },
  {
    name: "Khulna",
    districts: [
      {
        name: "Bagerhat",
        areas: [
          "Bagerhat Sadar",
          "Chitalmari",
          "Fakirhat",
          "Kachua",
          "Mollahat",
          "Mongla",
          "Morrelganj",
          "Rampal",
          "Sarankhola"
        ]
      },
      {
        name: "Chuadanga",
        areas: [
          "Alamdanga",
          "Chuadanga Sadar",
          "Damurhuda",
          "Jibannagar"
        ]
      },
      {
        name: "Jashore",
        areas: [
          "Abhaynagar",
          "Bagherpara",
          "Chougachha",
          "Jessore Sadar",
          "Jhikargacha",
          "Keshabpur",
          "Manirampur",
          "Sharsha"
        ]
      },
      {
        name: "Jhenaidah",
        areas: [
          "Harinakundu",
          "Jhenaidah Sadar",
          "Kaliganj",
          "Kotchandpur",
          "Moheshpur",
          "Shailkupa"
        ]
      },
      {
        name: "Khulna",
        areas: [
          "Botiaghata",
          "Dakop",
          "Digholia",
          "Dumuria",
          "Fultola",
          "Koyra",
          "Paikgasa",
          "Rupsha",
          "Terokhada"
        ]
      },
      {
        name: "Kushtia",
        areas: [
          "Bheramara",
          "Daulatpur",
          "Khoksa",
          "Kumarkhali",
          "Kushtia Sadar",
          "Mirpur"
        ]
      },
      {
        name: "Magura",
        areas: [
          "Magura Sadar",
          "Mohammadpur",
          "Shalikha",
          "Sreepur"
        ]
      },
      {
        name: "Meherpur",
        areas: [
          "Gangni",
          "Meherpur Sadar",
          "Mujibnagar"
        ]
      },
      {
        name: "Narail",
        areas: [
          "Kalia",
          "Lohagara",
          "Narail Sadar"
        ]
      },
      {
        name: "Satkhira",
        areas: [
          "Assasuni",
          "Debhata",
          "Kalaroa",
          "Kaliganj",
          "Satkhira Sadar",
          "Shyamnagar",
          "Tala"
        ]
      }
    ]
  },
  {
    name: "Mymensingh",
    districts: [
      {
        name: "Jamalpur",
        areas: [
          "Bokshiganj",
          "Dewangonj",
          "Islampur",
          "Jamalpur Sadar",
          "Madarganj",
          "Melandah",
          "Sarishabari"
        ]
      },
      {
        name: "Mymensingh",
        areas: [
          "Bhaluka",
          "Dhobaura",
          "Fulbaria",
          "Gafargaon",
          "Gouripur",
          "Haluaghat",
          "Iswarganj",
          "Muktagacha",
          "Mymensingh Sadar",
          "Nandail",
          "Phulpur",
          "Tarakanda",
          "Trishal"
        ]
      },
      {
        name: "Netrokona",
        areas: [
          "Atpara",
          "Barhatta",
          "Durgapur",
          "Kalmakanda",
          "Kendua",
          "Khaliajuri",
          "Madan",
          "Mohongonj",
          "Netrokona Sadar",
          "Purbadhala"
        ]
      },
      {
        name: "Sherpur",
        areas: [
          "Jhenaigati",
          "Nalitabari",
          "Nokla",
          "Sherpur Sadar",
          "Sreebordi"
        ]
      }
    ]
  },
  {
    name: "Rajshahi",
    districts: [
      {
        name: "Bogura",
        areas: [
          "Adamdighi",
          "Bogra Sadar",
          "Dhunot",
          "Dupchanchia",
          "Gabtali",
          "Kahaloo",
          "Nondigram",
          "Shajahanpur",
          "Shariakandi",
          "Sherpur",
          "Shibganj",
          "Sonatala"
        ]
      },
      {
        name: "Chapai Nawabganj",
        areas: [
          "Bholahat",
          "Chapainawabganj Sadar",
          "Gomostapur",
          "Nachol",
          "Shibganj"
        ]
      },
      {
        name: "Joypurhat",
        areas: [
          "Akkelpur",
          "Joypurhat Sadar",
          "Kalai",
          "Khetlal",
          "Panchbibi"
        ]
      },
      {
        name: "Naogaon",
        areas: [
          "Atrai",
          "Badalgachi",
          "Dhamoirhat",
          "Manda",
          "Mohadevpur",
          "Naogaon Sadar",
          "Niamatpur",
          "Patnitala",
          "Porsha",
          "Raninagar",
          "Sapahar"
        ]
      },
      {
        name: "Natore",
        areas: [
          "Bagatipara",
          "Baraigram",
          "Gurudaspur",
          "Lalpur",
          "Naldanga",
          "Natore Sadar",
          "Singra"
        ]
      },
      {
        name: "Pabna",
        areas: [
          "Atghoria",
          "Bera",
          "Bhangura",
          "Chatmohar",
          "Faridpur",
          "Ishurdi",
          "Pabna Sadar",
          "Santhia",
          "Sujanagar"
        ]
      },
      {
        name: "Rajshahi",
        areas: [
          "Bagha",
          "Bagmara",
          "Charghat",
          "Durgapur",
          "Godagari",
          "Mohonpur",
          "Paba",
          "Puthia",
          "Tanore"
        ]
      },
      {
        name: "Sirajganj",
        areas: [
          "Belkuchi",
          "Chauhali",
          "Kamarkhand",
          "Kazipur",
          "Raigonj",
          "Shahjadpur",
          "Sirajganj Sadar",
          "Tarash",
          "Ullapara"
        ]
      }
    ]
  },
  {
    name: "Rangpur",
    districts: [
      {
        name: "Dinajpur",
        areas: [
          "Birampur",
          "Birganj",
          "Birol",
          "Bochaganj",
          "Chirirbandar",
          "Dinajpur Sadar",
          "Fulbari",
          "Ghoraghat",
          "Hakimpur",
          "Kaharol",
          "Khansama",
          "Nawabganj",
          "Parbatipur"
        ]
      },
      {
        name: "Gaibandha",
        areas: [
          "Gaibandha Sadar",
          "Gobindaganj",
          "Palashbari",
          "Phulchari",
          "Sadullapur",
          "Saghata",
          "Sundarganj"
        ]
      },
      {
        name: "Kurigram",
        areas: [
          "Bhurungamari",
          "Charrajibpur",
          "Chilmari",
          "Kurigram Sadar",
          "Nageshwari",
          "Phulbari",
          "Rajarhat",
          "Rowmari",
          "Ulipur"
        ]
      },
      {
        name: "Lalmonirhat",
        areas: [
          "Aditmari",
          "Hatibandha",
          "Kaliganj",
          "Lalmonirhat Sadar",
          "Patgram"
        ]
      },
      {
        name: "Nilphamari",
        areas: [
          "Dimla",
          "Domar",
          "Jaldhaka",
          "Kishorganj",
          "Nilphamari Sadar",
          "Syedpur"
        ]
      },
      {
        name: "Panchagarh",
        areas: [
          "Atwari",
          "Boda",
          "Debiganj",
          "Panchagarh Sadar",
          "Tetulia"
        ]
      },
      {
        name: "Rangpur",
        areas: [
          "Badargonj",
          "Gangachara",
          "Kaunia",
          "Mithapukur",
          "Pirgacha",
          "Pirgonj",
          "Rangpur Sadar",
          "Taragonj"
        ]
      },
      {
        name: "Thakurgaon",
        areas: [
          "Baliadangi",
          "Haripur",
          "Pirganj",
          "Ranisankail",
          "Thakurgaon Sadar"
        ]
      }
    ]
  },
  {
    name: "Sylhet",
    districts: [
      {
        name: "Habiganj",
        areas: [
          "Ajmiriganj",
          "Bahubal",
          "Baniachong",
          "Chunarughat",
          "Habiganj Sadar",
          "Lakhai",
          "Madhabpur",
          "Nabiganj"
        ]
      },
      {
        name: "Moulvibazar",
        areas: [
          "Barlekha",
          "Juri",
          "Kamolganj",
          "Kulaura",
          "Moulvibazar Sadar",
          "Rajnagar",
          "Sreemangal"
        ]
      },
      {
        name: "Sunamganj",
        areas: [
          "Bishwambarpur",
          "Chhatak",
          "Derai",
          "Dharmapasha",
          "Dowarabazar",
          "Jagannathpur",
          "Jamalganj",
          "Madhyanagar",
          "Shalla",
          "South Sunamganj",
          "Sunamganj Sadar",
          "Tahirpur"
        ]
      },
      {
        name: "Sylhet",
        areas: [
          "Balaganj",
          "Beanibazar",
          "Bishwanath",
          "Companiganj",
          "Dakshinsurma",
          "Fenchuganj",
          "Golapganj",
          "Gowainghat",
          "Jaintiapur",
          "Kanaighat",
          "Osmaninagar",
          "Sylhet Sadar",
          "Zakiganj"
        ]
      }
    ]
  }
];
