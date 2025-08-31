
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ZumaEventsABI = {
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "attendee",
          "type": "address"
        }
      ],
      "name": "AttendeeAccepted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "EventCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint64",
          "name": "ageCt",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "ageProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint64",
          "name": "skillCt",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "skillProof",
          "type": "bytes"
        }
      ],
      "name": "attend",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        }
      ],
      "name": "closeEvent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dateTime",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "uint64",
          "name": "minAgePlain",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "minSkillPlain",
          "type": "uint64"
        }
      ],
      "name": "createEvent",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "events",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dateTime",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isOpen",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "organizer",
          "type": "address"
        },
        {
          "internalType": "euint64",
          "name": "minAge",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "minSkill",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "acceptedCount",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        }
      ],
      "name": "getAcceptedCount",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllEvents",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "dateTime",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "location",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isOpen",
              "type": "bool"
            },
            {
              "internalType": "address",
              "name": "organizer",
              "type": "address"
            },
            {
              "internalType": "euint64",
              "name": "minAge",
              "type": "bytes32"
            },
            {
              "internalType": "euint64",
              "name": "minSkill",
              "type": "bytes32"
            },
            {
              "internalType": "euint64",
              "name": "acceptedCount",
              "type": "bytes32"
            }
          ],
          "internalType": "struct ZumaEvents.EventData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "getOwnerEvents",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "dateTime",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "location",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isOpen",
              "type": "bool"
            },
            {
              "internalType": "address",
              "name": "organizer",
              "type": "address"
            },
            {
              "internalType": "euint64",
              "name": "minAge",
              "type": "bytes32"
            },
            {
              "internalType": "euint64",
              "name": "minSkill",
              "type": "bytes32"
            },
            {
              "internalType": "euint64",
              "name": "acceptedCount",
              "type": "bytes32"
            }
          ],
          "internalType": "struct ZumaEvents.EventData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "eventId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserAccepted",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextEventId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;

