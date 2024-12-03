const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { expect } = require('chai')
const Teams = require("../src/models/Teams");
const teamService = require('../src/services/teamService')

describe("Create and Get Teams Test", () => {
    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    const createTeams = async () => {
        const team1Data = {
            name: "Team Alpha",
            acronym: "ALPHA",
            textChannelID: "12345",
            voiceChannelID: "67890",
            roleID: "11111",
            players: [],
        };

        const team2Data = {
            name: "Team Beta",
            acronym: "BETA",
            textChannelID: "54321",
            voiceChannelID: "09876",
            roleID: "22222",
            players: [],
        };

        await Teams.create(team1Data);
        await Teams.create(team2Data);
    };

    it("should return 2 team documents", async () => {
        await createTeams();

        const teams = await teamService.getTeams()
        expect(teams.length).to.equal(2)
    })

    it("should fail to create a team with missing required fields", async () => {
        try {
            await Teams.create({});
        } catch (error) {
            expect(error).to.exist;
            expect(error.name).to.equal("ValidationError");
        }
    });
})

describe("Update Team Fields", () => {
    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    const createTeams = async () => {
        const team1Data = {
            name: "Team Alpha",
            acronym: "ALPHA",
            textChannelID: "12345",
            voiceChannelID: "67890",
            roleID: "11111",
            players: [],
        };

        const team2Data = {
            name: "Team Beta",
            acronym: "BETA",
            textChannelID: "54321",
            voiceChannelID: "09876",
            roleID: "22222",
            players: [],
        };

        let team1 = await Teams.create(team1Data);
        let team2 = await Teams.create(team2Data);

        return { team1, team2 }
    };

    it("should update textChannelID", async () => {
        const {team1, team2} = await createTeams();
        const updatedTeam1 = await teamService.updateTeamField(team1._id, 'textChannelID', '54321')
        const updatedTeam2 = await teamService.updateTeamField(team2._id, 'textChannelID', '12345')

        expect(updatedTeam1.textChannelID).to.equal('54321')
        expect(updatedTeam2.textChannelID).to.equal('12345')
    })

    it("should update voiceChannelID", async () => {
        const {team1, team2} = await createTeams();
        const updatedTeam1 = await teamService.updateTeamField(team1._id, 'voiceChannelID', '09876')
        const updatedTeam2 = await teamService.updateTeamField(team2._id, 'voiceChannelID', '67890')

        expect(updatedTeam1.voiceChannelID).to.equal('09876')
        expect(updatedTeam2.voiceChannelID).to.equal('67890')
    })

    it("should update roleID to null", async () => {
        const {team1, team2} = await createTeams();

        const updatedTeam1 = await teamService.updateTeamField(team1._id, 'roleID', null)
        const updatedTeam2 = await teamService.updateTeamField(team2._id, 'roleID', null)

        expect(updatedTeam1.roleID).to.equal(null)
        expect(updatedTeam2.roleID).to.equal(null)
    })
})